// enums.ts
export enum FieldResponseType {
    Text                  = 'Text',
    Float                 = 'Float',
    Integer               = 'Integer',
    Boolean               = 'Boolean',
    Object                = 'Object',
    TextArray             = 'Text Array',
    FloatArray            = 'Float Array',
    IntegerArray          = 'Integer Array',
    BooleanArray          = 'Boolean Array',
    ObjectArray           = 'Object Array',
    Biometrics            = 'Biometrics',
    SingleChoiceSelection = 'Single Choice Selection',
    MultiChoiceSelection  = 'Multi Choice Selection',
    File                  = 'File',
    Date                  = 'Date',
    DateTime              = 'DateTime',
    Rating                = 'Rating',
    Location              = 'Location',
    Range                 = 'Range',
    Ok                    = 'Ok',
    None                  = 'None',
}

export enum LogicType {
    Skip        = 'Skip',
    Calculation = 'Calculation',
    Validation  = 'Validation',
}

export enum OperationType {
    Logical           = 'Logical',
    Mathematical      = 'Mathematical',
    Composition       = 'Composition',
    Iterate           = 'Iterate',
    FunctionExpression = 'FunctionExpression'
}

export enum CompositionOperatorType {
    And  = 'And',
    Or   = 'Or',
    Xor  = 'Xor',
    None = 'None'
}

export enum LogicalOperatorType {
    Equal                     = 'Equal',
    NotEqual                  = 'NotEqual',
    GreaterThan               = 'GreaterThan',
    GreaterThanOrEqual        = 'GreaterThanOrEqual',
    LessThan                  = 'LessThan',
    LessThanOrEqual           = 'LessThanOrEqual',
    In                        = 'In',
    NotIn                     = 'NotIn',
    Contains                  = 'Contains',
    DoesNotContain            = 'DoesNotContain',
    Between                   = 'Between',
    IsTrue                    = 'IsTrue',
    IsFalse                   = 'IsFalse',
    Exists                    = 'Exists',
    HasConsecutiveOccurrences = 'HasConsecutiveOccurrences',
    RangesOverlap             = 'RangesOverlap',
    None                      = 'None',
}

export enum MathematicalOperatorType {
    Add        = 'Add',
    Subtract   = 'Subtract',
    Divide     = 'Divide',
    Multiply   = 'Multiply',
    Percentage = 'Percentage',
    Power      = 'Power',
    Modulo     = 'Modulo',
    None       = 'None',
}

export enum OperandDataType {
    Float    = 'Float',
    Integer  = 'Integer',
    Boolean  = 'Boolean',
    Text     = 'Text',
    DateTime = 'DateTime',
    Location = 'Location',
    Array    = 'Array',
    Object   = 'Object',
    Date     = 'Date',
}

export enum OperandType {
    Constant       = 'Constant',
    FieldReference = 'FieldReference',
    Function       = 'Function',
    Mathematical = 'Mathematical',
}

export type OperatorType = LogicalOperatorType | MathematicalOperatorType | CompositionOperatorType;
