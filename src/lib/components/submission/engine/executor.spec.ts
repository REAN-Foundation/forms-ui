import { describe, it, expect, beforeEach } from 'vitest';
import { FormRuleExecutor } from './executor';
import type { Form, FormField } from './interfaces';
import { FieldResponseType, LogicType, OperationType, LogicalOperatorType, OperandDataType, OperandType, CompositionOperatorType } from './enums';

// Small helpers to build operands/operations succinctly
const constOperand = (value: any) => ({
	Type: OperandType.Constant,
	DataType: OperandDataType.Text,
	Value: value
} as const);

const fieldRef = (fieldId: string) => ({
	Type: OperandType.FieldReference,
	DataType: OperandDataType.Text,
	FieldId: fieldId
} as const);

const logicalOp = (operator: LogicalOperatorType, ...operands: any[]) => ({
	id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
	Type: OperationType.Logical,
	Operator: operator,
	Operands: operands
} as const);

const and = (...children: any[]) => ({
	id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
	Type: OperationType.Composition,
	Operator: CompositionOperatorType.And,
	Children: children
} as const);

describe('FormRuleExecutor', () => {
	let baseForm: Form;

	beforeEach(() => {
		baseForm = {
			id: 'form-1',
			Name: 'Test Form',
			Fields: []
		};
	});

	it('initializes field values from provided form fields', () => {
		const fields: FormField[] = [
			{
				FieldId: 'a',
				Name: 'A',
				Label: 'A',
				ResponseType: FieldResponseType.Text,
				Required: false,
				Value: 'seed'
			}
		];
		const form: Form = { ...baseForm, Fields: fields };
		const executor = new FormRuleExecutor(form);
		expect(executor.getFieldValue('a')).toBe('seed');
	});

	it('evaluates skip logic: shouldSkip true when condition matches', () => {
		const fields: FormField[] = [
			{
				FieldId: 'x',
				Name: 'X',
				Label: 'X',
				ResponseType: FieldResponseType.Text,
				Required: false
			},
			{
				FieldId: 'y',
				Name: 'Y',
				Label: 'Y',
				ResponseType: FieldResponseType.Text,
				Required: false,
				SkipLogic: {
					id: 'sl-1',
					Type: LogicType.Skip,
					FieldId: 'y',
					Enabled: true,
					Rules: [
						{
							id: 'r1',
							Name: 'skip-when-x-is-yes',
							Operation: logicalOp(LogicalOperatorType.Equal, fieldRef('x'), constOperand('yes')),
							SkipWhenTrue: true
						}
					]
				}
			}
		];
		const form: Form = { ...baseForm, Fields: fields };
		const executor = new FormRuleExecutor(form);
		executor.setFieldValue('x', 'yes');
		const res = executor.executeFieldLogics('y');
		expect(res.shouldSkip).toBe(true);
	});

	it('applies calculation value only when allowed by settings and current value', () => {
		const fields: FormField[] = [
			{
				FieldId: 'n1',
				Name: 'N1',
				Label: 'N1',
				ResponseType: FieldResponseType.Integer,
				Required: false
			},
			{
				FieldId: 'n2',
				Name: 'N2',
				Label: 'N2',
				ResponseType: FieldResponseType.Integer,
				Required: false,
				// Intentionally use any to attach Settings that executor reads
				CalculateLogic: {
					id: 'cl-1',
					Type: LogicType.Calculation,
					FieldId: 'n2',
					Enabled: true,
					Rules: [
						{
							id: 'cr-1',
							Name: 'copy-n1',
							Operation: and(logicalOp(LogicalOperatorType.Exists, fieldRef('n1'))),
							RuleOutcome: JSON.stringify({ Value: 42 })
						} as any
					],
					FallbackValue: null,
					// Settings considered at logic level by executor if rule has none
					Settings: JSON.stringify({ AutoUpdate: true, AllowManualOverride: true })
				} as any
			}
		];
		const form: Form = { ...baseForm, Fields: fields };
		const executor = new FormRuleExecutor(form);

		// Provide a value for n1 so the Exists condition is true
		executor.setFieldValue('n1', 100);

		// Case 1: current empty, AutoUpdate true -> sets value
		let res = executor.executeFieldLogics('n2');
		expect(res.calculatedValue).toBe(42);
		expect(executor.getFieldValue('n2')).toBe(42);

		// Case 2: user changed value manually, AllowManualOverride true -> do not overwrite
		executor.setFieldValue('n2', 7);
		res = executor.executeFieldLogics('n2');
		expect(executor.getFieldValue('n2')).toBe(7);

		// Case 3: disallow manual override -> should overwrite
		(fields[1].CalculateLogic as any).Settings = JSON.stringify({ AutoUpdate: true, AllowManualOverride: false });
		res = executor.executeFieldLogics('n2');
		expect(executor.getFieldValue('n2')).toBe(42);

		// Case 4: AutoUpdate false, should only set if empty
		executor.setFieldValue('n2', 5);
		(fields[1].CalculateLogic as any).Settings = JSON.stringify({ AutoUpdate: false });
		res = executor.executeFieldLogics('n2');
		expect(executor.getFieldValue('n2')).toBe(5);
	});

	it('validateForm aggregates validation errors and required field errors', () => {
		const fields: FormField[] = [
			{
				FieldId: 'email',
				Name: 'Email',
				Label: 'Email',
				ResponseType: FieldResponseType.Text,
				Required: true,
				ValidateLogic: {
					id: 'vl-1',
					Type: LogicType.Validation,
					FieldId: 'email',
					Enabled: true,
					Rules: [
						{
							id: 'v1',
							Name: 'must-be-example',
							Operation: logicalOp(LogicalOperatorType.Contains, fieldRef('email'), constOperand('@example.com')),
							ErrorWhenFalse: true,
							ErrorMessage: 'Email must be @example.com'
						}
					]
				}
			},
			{
				FieldId: 'age',
				Name: 'Age',
				Label: 'Age',
				ResponseType: FieldResponseType.Integer,
				Required: true
			}
		];

		const form: Form = { ...baseForm, Fields: fields };
		const executor = new FormRuleExecutor(form);

		// Set invalid email and leave age empty
		executor.setFieldValue('email', 'user@domain.com');

		const { isValid, errors } = executor.validateForm();
		expect(isValid).toBe(false);
		expect(errors.get('email')).toContain('Email must be @example.com');
		expect(errors.get('age')?.[0]).toBe('Age is required');
	});
});


