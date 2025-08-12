import type {
  CalculationLogic,
  CalculationRule,
  CompositionOperation,
  Form,
  FormField,
  FunctionExpressionOperation,
  IterateOperation,
  Logic,
  LogicalOperation,
  MathematicalOperation,
  Operand,
  Operation,
  SkipLogic,
  SkipRule,
  ValidationLogic,
  ValidationRule
} from './interfaces';
import { CompositionOperatorType, FieldResponseType, LogicalOperatorType, LogicType, MathematicalOperatorType, OperandDataType, OperandType, OperationType } from './enums';

type BackendSection = any;
type BackendField = any;
type BackendLogic = any;
type BackendRule = any;
type BackendOperation = any;

function parseMaybeJson<T>(val: any): T | null {
  if (val == null) return null;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return null;
    }
  }
  return val as T;
}

function normalizeOperand(op: any): Operand {
  return {
    Type: op.Type as OperandType,
    DataType: op.DataType as OperandDataType,
    Value: op.Value,
    FieldId: op.FieldId,
    FunctionName: op.FunctionName,
    FunctionArgs: op.FunctionArgs ? (op.FunctionArgs as any[]).map(normalizeOperand) : undefined
  } satisfies Operand;
}

function normalizeOperation(op: BackendOperation): Operation {
  const type = op.Type as OperationType;
  switch (type) {
    case OperationType.Logical: {
      const operandsRaw = parseMaybeJson<any[]>(op.Operands) ?? op.Operands ?? [];
      const operands = (operandsRaw as any[]).map(normalizeOperand);
      return {
        id: op.id,
        Type: OperationType.Logical,
        Operator: op.Operator as LogicalOperatorType,
        Operands: operands
      } as LogicalOperation;
    }
    case OperationType.Mathematical: {
      const operandsRaw = parseMaybeJson<any[]>(op.Operands) ?? op.Operands ?? [];
      const operands = (operandsRaw as any[]).map(normalizeOperand);
      return {
        id: op.id,
        Type: OperationType.Mathematical,
        Operator: op.Operator as MathematicalOperatorType,
        Operands: operands
      } as MathematicalOperation;
    }
    case OperationType.Composition: {
      const childrenRaw = op.Children ?? [];
      const children = (childrenRaw as any[]).map(normalizeOperation);
      return {
        id: op.id,
        Type: OperationType.Composition,
        Operator: op.Operator as CompositionOperatorType,
        Children: children
      } as CompositionOperation;
    }
    case OperationType.Iterate: {
      return {
        id: op.id,
        Type: OperationType.Iterate,
        ArrayOperand: normalizeOperand(op.ArrayOperand),
        ItemAlias: op.ItemAlias,
        Operation: normalizeOperation(op.Operation)
      } as IterateOperation;
    }
    case OperationType.FunctionExpression: {
      const varsRaw = parseMaybeJson<Record<string, any>>(op.Variables) ?? op.Variables ?? {};
      const variables: Record<string, Operand> = {};
      Object.entries(varsRaw as Record<string, any>).forEach(([k, v]) => {
        variables[k] = normalizeOperand(v);
      });
      return {
        id: op.id,
        Type: OperationType.FunctionExpression,
        Expression: op.Expression,
        Variables: variables
      } as FunctionExpressionOperation;
    }
    default:
      // Best-effort fallback
      return op as Operation;
  }
}

function normalizeValidationLogic(fieldId: string, logic: BackendLogic | null | undefined): ValidationLogic | null {
  if (!logic) return null;
  const rules: ValidationRule[] = (logic.Rules ?? []).map((r: BackendRule) => ({
    id: r.id,
    Name: r.Name ?? 'Validation rule',
    Description: r.Description ?? undefined,
    Operation: normalizeOperation(r.Operation),
    ErrorWhenFalse: r.ErrorWhenFalse ?? true,
    ErrorMessage: r.ErrorMessage ?? 'Invalid value'
  }));
  return {
    id: logic.id,
    Type: LogicType.Validation,
    FieldId: fieldId,
    Enabled: logic.Enabled ?? true,
    Rules: rules
  } satisfies ValidationLogic;
}

function normalizeSkipLogic(fieldId: string, logic: BackendLogic | null | undefined): SkipLogic | null {
  if (!logic) return null;
  const rules: SkipRule[] = (logic.Rules ?? []).map((r: BackendRule) => ({
    id: r.id,
    Name: r.Name ?? 'Skip rule',
    Description: r.Description ?? undefined,
    Operation: normalizeOperation(r.Operation),
    SkipWhenTrue: r.SkipWhenTrue ?? true
  }));
  return {
    id: logic.id,
    Type: LogicType.Skip,
    FieldId: fieldId,
    Enabled: logic.Enabled ?? true,
    Rules: rules,
    DefaultSkip: logic.DefaultSkip ?? false
  } satisfies SkipLogic;
}

function normalizeCalculationLogic(fieldId: string, logic: BackendLogic | null | undefined): CalculationLogic | null {
  if (!logic) return null;
  const rules: CalculationRule[] = (logic.Rules ?? []).map((r: BackendRule) => ({
    id: r.id,
    Name: r.Name ?? 'Calculation rule',
    Description: r.Description ?? undefined,
    ConditionForOperation: r.ConditionForOperation ? normalizeOperation(r.ConditionForOperation) : undefined,
    Operation: normalizeOperation(r.Operation)
  }));
  return {
    id: logic.id,
    Type: LogicType.Calculation,
    FieldId: fieldId,
    Enabled: logic.Enabled ?? true,
    Rules: rules,
    FallbackValue: logic.FallbackValue ?? null
  } satisfies CalculationLogic;
}

function mapBackendFieldToEngineField(f: BackendField): FormField {
  const fieldId: string = f.id ?? f.FieldId;
  const name: string = f.Name ?? f.Title ?? f.DisplayCode ?? fieldId;
  const label: string = f.Label ?? f.Title ?? name;
  const responseType: FieldResponseType = (f.ResponseType as FieldResponseType) ?? FieldResponseType.Text;
  const required: boolean = (f.Required ?? f.IsRequired) ?? false;
  const validateLogic = normalizeValidationLogic(fieldId, f.ValidateLogic);
  const skipLogic = normalizeSkipLogic(fieldId, f.SkipLogic);
  const calcLogic = normalizeCalculationLogic(fieldId, f.CalculateLogic);
  return {
    FieldId: fieldId,
    Name: name,
    Label: label,
    ResponseType: responseType,
    Required: required,
    SkipLogic: skipLogic,
    CalculateLogic: calcLogic,
    ValidateLogic: validateLogic
  } satisfies FormField;
}

export function backendSectionsToEngineForm(sections: BackendSection[], formName: string): Form {
  const fields: FormField[] = [];
  const walk = (secs: BackendSection[]) => {
    for (const s of secs ?? []) {
      const formFields: BackendField[] = s.FormFields ?? [];
      for (const f of formFields) {
        fields.push(mapBackendFieldToEngineField(f));
      }
      if (s.Subsections && Array.isArray(s.Subsections)) {
        walk(s.Subsections);
      }
    }
  };
  walk(sections);
  return {
    id: 'runtime-form',
    Name: formName ?? 'Form',
    Fields: fields
  } satisfies Form;
}


