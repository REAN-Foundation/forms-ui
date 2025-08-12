// // demo.ts - Complete demonstration of the form rules system

// import {
//     Form,
//     LogicType,
//     FieldResponseType,
//     OperationType,
//     LogicalOperatorType,
//     CompositionOperatorType,
//     OperandType,
//     OperandDataType,
//     FormRuleExecutor,
//     OperationBuilder,
//     FormUtils
// } from './engine';

// // Example 1: Medical Assessment Form with Complex Rules
// function createMedicalAssessmentForm(): Form {
//     return {
//         id: 'medical-assessment',
//         Name: 'Patient Medical Assessment',
//         Fields: [
//             {
//                 FieldId: 'patient-age',
//                 Name: 'patient-age',
//                 Label: 'Patient Age',
//                 ResponseType: FieldResponseType.Integer,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'age-validation-logic',
//                     Type: LogicType.Validation,
//                     FieldId: 'patient-age',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'age-range-rule',
//                             Name: 'Validate age range',
//                             Operation: {
//                                 id: 'age-between-op',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.Between,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'patient-age' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 0 },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 150 }
//                                 ]
//                             },
//                             ErrorWhenFalse: true,
//                             ErrorMessage: 'Age must be between 0 and 150'
//                         }
//                     ]
//                 }

//             },
//             {
//                 FieldId: 'is-adult',
//                 Name: 'is-adult',
//                 Label: 'Is Adult',
//                 ResponseType: FieldResponseType.Boolean,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'adult-calculation',
//                     Type: LogicType.Calculation,
//                     FieldId: 'is-adult',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'calculate-adult',
//                             Name: 'Calculate if adult',
//                             Operation: {
//                                 id: 'adult-check-op',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.GreaterThanOrEqual,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'patient-age' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 18 }
//                                 ]
//                             }
//                         }
//                     ]
//                 }

//             },
//             {
//                 FieldId: 'guardian-name',
//                 Name: 'guardian-name',
//                 Label: 'Guardian Name',
//                 ResponseType: FieldResponseType.Text,
//                 Required: true,
//                 SkipLogic:
//                 {
//                     id: 'guardian-skip',
//                     Type: LogicType.Skip,
//                     FieldId: 'guardian-name',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'skip-if-adult',
//                             Name: 'Skip guardian if adult',
//                             Operation: {
//                                 id: 'is-adult-check',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.IsTrue,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Boolean, FieldId: 'is-adult' }
//                                 ]
//                             },
//                             SkipWhenTrue: true
//                         }
//                     ]
//                 }

//             },
//             {
//                 FieldId: 'systolic-bp',
//                 Name: 'systolic-bp',
//                 Label: 'Systolic Blood Pressure',
//                 ResponseType: FieldResponseType.Integer,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'systolic-validation',
//                     Type: LogicType.Validation,
//                     FieldId: 'systolic-bp',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'systolic-range',
//                             Name: 'Validate systolic BP range',
//                             Operation: {
//                                 id: 'systolic-between',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.Between,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'systolic-bp' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 60 },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 250 }
//                                 ]
//                             },
//                             ErrorMessage: 'Systolic BP must be between 60 and 250',
//                             ErrorWhenFalse: true
//                         }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'diastolic-bp',
//                 Name: 'diastolic-bp',
//                 Label: 'Diastolic Blood Pressure',
//                 ResponseType: FieldResponseType.Integer,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'diastolic-validation',
//                     Type: LogicType.Validation,
//                     FieldId: 'diastolic-bp',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'diastolic-range',
//                             Name: 'Validate diastolic BP range',
//                             Operation: {
//                                 id: 'diastolic-between',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.Between,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'diastolic-bp' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 40 },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 150 }
//                                 ]
//                             },
//                             ErrorMessage: 'Diastolic BP must be between 40 and 150',
//                             ErrorWhenFalse: true
//                         },
//                         {
//                             id: 'diastolic-less-than-systolic',
//                             Name: 'Diastolic must be less than systolic',
//                             Operation: {
//                                 id: 'bp-comparison',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.LessThan,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'diastolic-bp' },
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'systolic-bp' }
//                                 ]
//                             },
//                             ErrorMessage: 'Diastolic BP must be less than Systolic BP',
//                             ErrorWhenFalse: true
//                         }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'bp-category',
//                 Name: 'bp-category',
//                 Label: 'Blood Pressure Category',
//                 ResponseType: FieldResponseType.Text,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'bp-category-calc',
//                     Type: LogicType.Calculation,
//                     FieldId: 'bp-category',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'normal-bp',
//                             Name: 'Normal BP',
//                             Operation: {
//                                 id: 'normal-bp-check',
//                                 Type: OperationType.Composition,
//                                 Operator: CompositionOperatorType.And,
//                                 Children: [
//                                     {
//                                         id: 'systolic-normal',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.LessThan,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'systolic-bp' },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 120 }
//                                         ]
//                                     },
//                                     {
//                                         id: 'diastolic-normal',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.LessThan,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'diastolic-bp' },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 80 }
//                                         ]
//                                     }
//                                 ]
//                             }
//                         },
//                         {
//                             id: 'elevated-bp',
//                             Name: 'Elevated BP',
//                             Operation: {
//                                 id: 'elevated-bp-check',
//                                 Type: OperationType.Composition,
//                                 Operator: CompositionOperatorType.And,
//                                 Children: [
//                                     {
//                                         id: 'systolic-elevated',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.Between,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'systolic-bp' },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 120 },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 129 }
//                                         ]
//                                     },
//                                     {
//                                         id: 'diastolic-not-high',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.LessThan,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'diastolic-bp' },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 80 }
//                                         ]
//                                     }
//                                 ]
//                             }
//                         }
//                     ],
//                     FallbackValue: {
//                         id: 'high-bp-fallback',
//                         Name: 'High Blood Pressure',
//                         Operation: {
//                             id: 'always-true',
//                             Type: OperationType.Logical,
//                             Operator: LogicalOperatorType.IsTrue,
//                             Operands: [
//                                 { Type: OperandType.Constant, DataType: OperandDataType.Boolean, Value: true }
//                             ]
//                         },
//                         ErrorMessage: 'High Blood Pressure'
//                     }
//                 }
//             }
//         ]
//     };
// }


// export function createAdvancedFormExample3(): Form {
//     return {
//         id: 'advanced-form',
//         Name: 'Advanced Medical Assessment',
//         Fields: [
//             {
//                 FieldId: '81bdaaef-f6f2-4fe8-81f5-c29cdd56876c',
//                 Name: 'What is your age?',
//                 Label: 'Please enter your current age in years',
//                 ResponseType: FieldResponseType.Integer,
//                 Required: true,
//                 // ValidateLogic:
//                 // "Sequence": 1,
//                 // "CorrectAnswer": "25",
//                 // "IsRequired": true,
//                 // "Hint": "Enter a number between 1 and 120",
//                 // "Options": [],
//                 // "ImageResourceId": null,
//                 // "RangeMin": "1.00",
//                 // "RangeMax": "120.00",
//                 // "DefaultExpectedUnit": null,
//                 // "PageBreakAfter": false,
//                 // "ParentFormSection": {
//                 //     "id": "b0b879f5-204a-44f2-b1e5-51de05b01112",
//                 //     "Title": "New Form Section",
//                 //     "Description": "This is a new form section for organizing form fields",
//                 //     "DisplayCode": "SECTION_#STM2El1ktXYGujE2",
//                 //     "Sequence": 1,
//                 //     "ParentSectionId": "c8da3162-6a32-4685-b6b5-3e32535d3bad",
//                 //     "CreatedAt": "2025-07-24T11:58:26.190Z"
//                 // },
//                 // "FormTemplate": {
//                 //     "id": "d44276b2-7a77-412e-acfe-c67e391fbde4",
//                 //     "Title": "Assessment First",
//                 //     "Description": "This is description",
//                 //     "Type": "Questionnaire",
//                 //     "DisplayCode": "ASSESS_TEMP_#ItABTChLo5Wsaweqv",
//                 //     "OwnerUserId": "9f3de126-dde8-4511-b17c-e5c16ca957e8",
//                 //     "RootSectionId": "c8da3162-6a32-4685-b6b5-3e32535d3bad",
//                 //     "DefaultSectionNumbering": false,
//                 //     "CreatedAt": "2025-07-24T11:57:17.493Z"
//                 // },
//                 // "CreatedAt": "2025-07-24T11:59:31.274Z",
//                 // "UpdatedAt": "2025-07-24T12:31:51.000Z",
//                 // "SkipLogicId": null,
//                 // "CalculateLogicId": null,
//                 // "ValidateLogicId": "100dd882-293c-4268-a1f2-02c2a291647d",
//                 // "SkipLogic": null,
//                 // "CalculateLogic": null,
//                 ValidateLogic: {
//                     id: '100dd882-293c-4268-a1f2-02c2a291647d',
//                     Type: LogicType.Validation,
//                     FieldId: '81bdaaef-f6f2-4fe8-81f5-c29cdd56876c',
//                     Enabled: true,
//                     // "CreatedAt": "2025-07-24T12:01:29.298Z",
//                     Rules: [
//                         {
//                             id: '314deb54-be41-4807-a90f-c3ce583db5a8',
//                             Name: 'Adult check rule',
//                             Description: 'Validate that person is adult',
//                             Operation: {
//                                 id: 'b8a1c0b0-c01c-4659-a5fd-f9f6c2a22457',
//                                 // Name: 'Age validation operation',
//                                 // Description: 'Check whether name is correct and it doesnt have have ',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.GreaterThanOrEqual,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: '81bdaaef-f6f2-4fe8-81f5-c29cdd56876c' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 18 }
//                                 ]
//                             },
//                             ErrorWhenFalse: true,
//                             ErrorMessage: 'Check user is adult or not',
//                             // RuleType: 'Validation',
//                             // LogicId: '100dd882-293c-4268-a1f2-02c2a291647d',
//                             // CreatedAt: '2025-07-25T07:58:01.632Z',
//                             // UpdatedAt: '2025-07-25T07:58:01.632Z'
//                         },
//                         // {
//                         //     id: 'cdeacdc1-ba25-48d9-8b15-3e926987eb25',
//                         //     Name: 'Age Validation Rule',
//                         //     Description: 'Validate that age is between 0 and 150',
//                         //     Operation: {
//                         //         id: '2a2496eb-3420-492a-973c-7def5a21aeee',
//                         //         // Name: 'Name validation operation',
//                         //         // Description: 'Check whether name is correct and it doesnt have have ',
//                         //         Type: OperationType.Logical,
//                         //         Operator: LogicalOperatorType.GreaterThanOrEqual,
//                         //         Operands: [
//                         //             { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: '81bdaaef-f6f2-4fe8-81f5-c29cdd56876c' },
//                         //             { Type: OperandType.Constant, DataType: OperandDataType.Integer, Value: 18 }
//                         //         ]
//                         //     },
//                         //     ErrorWhenFalse: true,
//                         //     ErrorMessage: 'Age must be between 0 and 150 years',
//                         //     // RuleType: 'Validation',
//                         //     // LogicId: '100dd882-293c-4268-a1f2-02c2a291647d',
//                         //     // CreatedAt: '2025-07-24T12:39:59.857Z',
//                         //     // UpdatedAt: '2025-07-25T07:59:17.335Z'
//                         // }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b',
//                 Name: 'What is your email?',
//                 Label: 'Please enter your email as it appears on official documents',
//                 ResponseType: FieldResponseType.Text,
//                 Required: true,
//                 ValidateLogic: {
//                     id: 'bf348643-c23d-499a-afd3-617782d06e21',
//                     Type: LogicType.Validation,
//                     FieldId: 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'f8e14624-50bc-4ec1-9efc-de49e2e78a9f',
//                             Name: 'Email validation rule',
//                             Description: 'Validate that email is correct',
//                             Operation: {
//                                 id: 'aa48f853-acdc-4fbf-be44-a73ef7c8016f',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.Contains,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'gmail.com' }
//                                 ]
//                             },
//                             ErrorWhenFalse: true,
//                             ErrorMessage: 'Email must contain gmail.com',
//                             // RuleType: 'Validation',
//                             // LogicId: 'bf348643-c23d-499a-afd3-617782d06e21',
//                             // CreatedAt: '2025-07-29T10:39:36.857Z',
//                             // UpdatedAt: '2025-07-29T10:39:36.857Z'
//                         }
//                     ]
//                 }
//             }
//         ]
//         //     "ParentFormSection": {
//         //         "id": "34c8e7ee-3b97-4c9e-9c70-26fdcf01e64a",
//         //         "Title": "Section 1",
//         //         "Description": "This is a new form section for organizing form fields",
//         //         "DisplayCode": "SECTION_#e7FFHgZCaguGwanv",
//         //         "Sequence": 1,
//         //         "ParentSectionId": "8def9dfd-e4fa-4225-bc9b-41225daf309d",
//         //         "CreatedAt": "2025-07-29T10:32:38.909Z"
//         //     },
//         //     "FormTemplate": {
//         //         "id": "00b7484e-584b-4488-a655-6eb63dfdbb1d",
//         //         "Title": "Test 1",
//         //         "Description": "This is description",
//         //         "Type": "Questionnaire",
//         //         "DisplayCode": "ASSESS_TEMP_#OTqKkbjJTg0yQpDHP",
//         //         "OwnerUserId": "9f3de126-dde8-4511-b17c-e5c16ca957e8",
//         //         "RootSectionId": "8def9dfd-e4fa-4225-bc9b-41225daf309d",
//         //         "DefaultSectionNumbering": false,
//         //         "CreatedAt": "2025-07-29T10:31:34.260Z"
//         //     },
//         //     "CreatedAt": "2025-07-29T10:33:51.187Z",
//         //     "UpdatedAt": "2025-07-29T10:58:50.000Z",
//         //     "SkipLogicId": null,
//         //     "CalculateLogicId": null,
//         //     "ValidateLogicId": "bf348643-c23d-499a-afd3-617782d06e21",
//         //     "SkipLogic": null,
//         //     "CalculateLogic": null,
//         //     "ValidateLogic": {
//         //         "id": "bf348643-c23d-499a-afd3-617782d06e21",
//         //         "Type": "Validation",
//         //         "FieldId": "c88c6869-2ee7-4888-8b5e-3002ed9ec24b",
//         //         "Enabled": true,
//         //         "CreatedAt": "2025-07-29T10:34:24.760Z",
//         //         "Rules": [
//         //             {
//         //                 "id": "f8e14624-50bc-4ec1-9efc-de49e2e78a9f",
//         //                 "Name": "Adult check rule",
//         //                 "Description": "Validate that person is adult",
//         //                 "Operation": {
//         //                     "id": "aa48f853-acdc-4fbf-be44-a73ef7c8016f",
//         //                     "Name": "email validation operation",
//         //                     "Description": "Check whether email is correct ",
//         //                     "Type": "Logical",
//         //                     "Operator": "Contains",
//         //                     "Operands": "[{\"Type\": \"FieldReference\", \"DataType\": \"Text\", \"FieldId\": \"c88c6869-2ee7-4888-8b5e-3002ed9ec24b\"}, {\"Type\": \"Constant\", \"DataType\": \"Text\", \"Value\": \"gmail.com\"}]",
//         //                     "CreatedAt": "2025-07-29T10:39:36.857Z",
//         //                     "UpdatedAt": "2025-07-29T10:39:36.857Z"
//         //                 },
//         //                 "OperationType": "Logical",
//         //                 "OperationId": "aa48f853-acdc-4fbf-be44-a73ef7c8016f",
//         //                 "ErrorWhenFalse": true,
//         //                 "ErrorMessage": "Check user is adult or not",
//         //                 "RuleType": "Validation",
//         //                 "LogicId": "bf348643-c23d-499a-afd3-617782d06e21",
//         //                 "CreatedAt": "2025-07-29T10:44:06.140Z",
//         //                 "UpdatedAt": "2025-07-29T10:44:06.140Z"
//         //             }
//         //         ]
//         //     }
//         // }
//         // ]
//     };
// }

// // Example 2: Financial Calculator Form
// function createFinancialCalculatorForm(): Form {
//     return {
//         id: 'financial-calculator',
//         Name: 'Loan Calculator',
//         Fields: [
//             {
//                 FieldId: 'loan-amount',
//                 Name: 'loan-amount',
//                 Label: 'Loan Amount',
//                 ResponseType: FieldResponseType.Float,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'loan-validation',
//                     Type: LogicType.Validation,
//                     FieldId: 'loan-amount',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'positive-amount',
//                             Name: 'Positive loan amount',
//                             Operation: OperationBuilder.greaterThan('loan-amount', 0),
//                             ErrorMessage: 'Loan amount must be positive',
//                             ErrorWhenFalse: true
//                         }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'interest-rate',
//                 Name: 'interest-rate',
//                 Label: 'Annual Interest Rate (%)',
//                 ResponseType: FieldResponseType.Float,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'interest-validation',
//                     Type: LogicType.Validation,
//                     FieldId: 'interest-rate',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'valid-interest',
//                             Name: 'Valid interest rate',
//                             Operation: {
//                                 id: 'interest-range',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.Between,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: 'interest-rate' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Float, Value: 0 },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Float, Value: 100 }
//                                 ]
//                             },
//                             ErrorMessage: 'Interest rate must be between 0% and 100%',
//                             ErrorWhenFalse: true
//                         }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'loan-term',
//                 Name: 'loan-term',
//                 Label: 'Loan Term (months)',
//                 ResponseType: FieldResponseType.Integer,
//                 Required: true,
//                 ValidateLogic:
//                 {
//                     id: 'term-validation',
//                     Type: LogicType.Validation,
//                     FieldId: 'loan-term',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'valid-term',
//                             Name: 'Valid loan term',
//                             Operation: OperationBuilder.greaterThan('loan-term', 0),
//                             ErrorMessage: 'Loan term must be positive',
//                             ErrorWhenFalse: true
//                         }
//                     ]
//                 }

//             },
//             {
//                 FieldId: 'monthly-payment',
//                 Name: 'monthly-payment',
//                 Label: 'Monthly Payment',
//                 ResponseType: FieldResponseType.Float,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'payment-calculation',
//                     Type: LogicType.Calculation,
//                     FieldId: 'monthly-payment',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'calculate-payment',
//                             Name: 'Calculate monthly payment',
//                             Operation: {
//                                 id: 'payment-formula',
//                                 Type: OperationType.FunctionExpression,
//                                 Expression: 'P * (r / 1200) / (1 - pow(1 + (r / 1200), -n))',
//                                 Variables: {
//                                     P: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: 'loan-amount' },
//                                     r: { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: 'interest-rate' },
//                                     n: { Type: OperandType.FieldReference, DataType: OperandDataType.Integer, FieldId: 'loan-term' }
//                                 }
//                             }
//                         }
//                     ]
//                 }

//             },
//             {
//                 FieldId: 'total-payment',
//                 Name: 'total-payment',
//                 Label: 'Total Payment',
//                 ResponseType: FieldResponseType.Float,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'total-calculation',
//                     Type: LogicType.Calculation,
//                     FieldId: 'total-payment',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'calculate-total',
//                             Name: 'Calculate total payment',
//                             Operation: OperationBuilder.multiply('monthly-payment', 'loan-term')
//                         }
//                     ]
//                 }
//             }
//         ]
//     };
// }

// // Example 6: Composite Email Validation Form (Complex nested rules)
// function createCompositeEmailValidationForm(): Form {
//     const emailFieldId = 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b';

//     return {
//         id: 'email-form',
//         Name: 'Email Validation Form',
//         Fields: [
//             {
//                 FieldId: emailFieldId,
//                 Name: 'email',
//                 Label: 'What is your email?',
//                 ResponseType: FieldResponseType.Text,
//                 Required: true,
//                 SkipLogic: null,
//                 CalculateLogic: null,
//                 ValidateLogic: {
//                     id: 'bf348643-c23d-499a-afd3-617782d06e21',
//                     Type: LogicType.Validation,
//                     FieldId: emailFieldId,
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: '2c58d1cc-61b3-4ffc-9a76-69279f2a84f8',
//                             Name: 'email checking rule',
//                             Description: 'email checking rule',
//                             Operation: {
//                                 id: '0c1eae4d-951f-43e8-b0b0-5ed237668e37',
//                                 Type: OperationType.Composition,
//                                 Operator: CompositionOperatorType.Or,
//                                 Children: [
//                                     {
//                                         id: '9eafec21-9c33-4e65-82c5-558fad2064eb',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.Equal,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'prashantkharade@gmail.com' }
//                                         ]
//                                     },
//                                     {
//                                         id: 'ec82573d-ed87-4269-b33f-cb95b21e7ef1',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.NotEqual,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'demo@gmail.com' }
//                                         ]
//                                     },
//                                     {
//                                         id: '13311fbb-0022-4aee-bbb3-8b8a331033e2',
//                                         Type: OperationType.Composition,
//                                         Operator: CompositionOperatorType.And,
//                                         Children: [
//                                             {
//                                                 id: '7befb4d0-edd1-4d66-84b8-0d8af3d315a6',
//                                                 Type: OperationType.Composition,
//                                                 Operator: CompositionOperatorType.Or,
//                                                 Children: [
//                                                     {
//                                                         id: 'efe59aa2-2630-4ec6-8f85-61b3ee6ffb21',
//                                                         Type: OperationType.Logical,
//                                                         Operator: LogicalOperatorType.NotEqual,
//                                                         Operands: [
//                                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'xyz' }
//                                                         ]
//                                                     },
//                                                     {
//                                                         id: '0e575d36-aeff-4b9a-8880-5292b5488c6a',
//                                                         Type: OperationType.Logical,
//                                                         Operator: LogicalOperatorType.NotEqual,
//                                                         Operands: [
//                                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'abc' }
//                                                         ]
//                                                     }
//                                                 ]
//                                             },
//                                             {
//                                                 id: '530a2e52-b099-412f-8da8-7b83911878c7',
//                                                 Type: OperationType.Logical,
//                                                 Operator: LogicalOperatorType.DoesNotContain,
//                                                 Operands: [
//                                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                     { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'prashant' }
//                                                 ]
//                                             },
//                                             {
//                                                 id: '1d644f12-979d-4ed1-95fc-ac5f84395fdf',
//                                                 Type: OperationType.Logical,
//                                                 Operator: LogicalOperatorType.DoesNotContain,
//                                                 Operands: [
//                                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                     { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'kharade' }
//                                                 ]
//                                             }
//                                         ]
//                                     }
//                                 ]
//                             },
//                             ErrorWhenFalse: true,
//                             ErrorMessage: 'email checking rule'
//                         },
//                         {
//                             id: '7657dfa6-1b13-4531-aa62-4200345c4b3c',
//                             Name: 'Adult check rule',
//                             Description: 'Validate that person is adult',
//                             Operation: {
//                                 id: '030acfb5-db28-409d-87f8-6f9b8131e317',
//                                 Type: OperationType.Composition,
//                                 Operator: CompositionOperatorType.And,
//                                 Children: [
//                                     {
//                                         id: '257c9cb4-cd5e-42bb-86f5-4d80dab41781',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.Equal,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'demo@gmail.com' }
//                                         ]
//                                     },
//                                     {
//                                         id: 'c5b43758-c482-49df-b5cc-6130b7c014e7',
//                                         Type: OperationType.Logical,
//                                         Operator: LogicalOperatorType.NotEqual,
//                                         Operands: [
//                                             { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                             { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'prashantkharade@gmail.com' }
//                                         ]
//                                     },
//                                     {
//                                         id: 'bd8bf4a9-767b-4f34-9ac6-cc5a417343d5',
//                                         Type: OperationType.Composition,
//                                         Operator: CompositionOperatorType.Or,
//                                         Children: [
//                                             {
//                                                 id: '605f872b-aa26-468e-8ead-e772f8f2a2a7',
//                                                 Type: OperationType.Logical,
//                                                 Operator: LogicalOperatorType.Contains,
//                                                 Operands: [
//                                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                     { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'xyz' }
//                                                 ]
//                                             },
//                                             {
//                                                 id: '32944a7d-55a8-4d92-b2a2-af1cddd8123b',
//                                                 Type: OperationType.Logical,
//                                                 Operator: LogicalOperatorType.DoesNotContain,
//                                                 Operands: [
//                                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Text, FieldId: emailFieldId },
//                                                     { Type: OperandType.Constant, DataType: OperandDataType.Text, Value: 'abc' }
//                                                 ]
//                                             }
//                                         ]
//                                     }
//                                 ]
//                             },
//                             ErrorWhenFalse: true,
//                             ErrorMessage: 'Check email is not of admins'
//                         }
//                     ]
//                 }
//             }
//         ]
//     };
// }

// // Main demo function
// function runDemo() {
//     console.log('=== Form Field Rule-Based Evaluation System Demo ===\n');

//     // Demo 1: Medical Assessment Form
//     console.log('Demo 1: Medical Assessment Form');
//     console.log('--------------------------------');

//     const medicalForm = createMedicalAssessmentForm();
//     const medicalExecutor = new FormRuleExecutor(medicalForm);

//     // Test case 1: Minor patient
//     console.log('\nTest Case 1: Minor Patient (Age 12)');
//     medicalExecutor.setFieldValue('patient-age', 12);
//     medicalExecutor.setFieldValue('systolic-bp', 110);
//     medicalExecutor.setFieldValue('diastolic-bp', 70);

//     let results = medicalExecutor.executeAllFieldLogics();
//     console.log('Is Adult:', medicalExecutor.getFieldValue('is-adult')); // false
//     console.log('Guardian Name Required:', !results.get('guardian-name')?.shouldSkip); // true
//     console.log('BP Category:', medicalExecutor.getFieldValue('bp-category')); // Normal

//     // Test case 2: Adult patient with elevated BP
//     console.log('\nTest Case 2: Adult Patient (Age 35) with Elevated BP');
//     medicalExecutor.setFieldValue('patient-age', 35);
//     medicalExecutor.setFieldValue('systolic-bp', 125);
//     medicalExecutor.setFieldValue('diastolic-bp', 78);

//     results = medicalExecutor.executeAllFieldLogics();
//     console.log('Is Adult:', medicalExecutor.getFieldValue('is-adult')); // true
//     console.log('Guardian Name Required:', !results.get('guardian-name')?.shouldSkip); // false
//     console.log('BP Category:', medicalExecutor.getFieldValue('bp-category')); // Elevated

//     // Test validation
//     console.log('\nTest Case 3: Invalid BP Values');
//     medicalExecutor.setFieldValue('systolic-bp', 80);
//     medicalExecutor.setFieldValue('diastolic-bp', 90); // Invalid: diastolic > systolic

//     const validationResult = medicalExecutor.validateForm();
//     console.log('Form Valid:', validationResult.isValid);
//     console.log('Validation Errors:', validationResult.errors);

//     // Demo 2: Financial Calculator
//     console.log('\n\nDemo 2: Financial Calculator');
//     console.log('----------------------------');

//     const financialForm = createFinancialCalculatorForm();
//     const financialExecutor = new FormRuleExecutor(financialForm);

//     // Calculate loan payment
//     console.log('\nCalculating loan payment for:');
//     console.log('- Loan Amount: $100,000');
//     console.log('- Interest Rate: 5%');
//     console.log('- Term: 360 months (30 years)');

//     financialExecutor.setFieldValue('loan-amount', 100000);
//     financialExecutor.setFieldValue('interest-rate', 5);
//     financialExecutor.setFieldValue('loan-term', 360);

//     financialExecutor.executeAllFieldLogics();

//     const monthlyPayment = financialExecutor.getFieldValue('monthly-payment');
//     const totalPayment = financialExecutor.getFieldValue('total-payment');

//     console.log(`\nMonthly Payment: ${monthlyPayment?.toFixed(2)}`);
//     console.log(`Total Payment: ${totalPayment?.toFixed(2)}`);
//     console.log(`Total Interest: ${(totalPayment - 100000)?.toFixed(2)}`);

//     // Demo 3: Field Dependencies
//     console.log('\n\nDemo 3: Field Dependencies');
//     console.log('--------------------------');

//     console.log('\nMedical Form Field Dependencies:');
//     const ageDependents = FormUtils.findDependentFields(medicalForm, 'patient-age');
//     console.log('Fields that depend on patient-age:', Array.from(ageDependents));

//     const systolicDependents = FormUtils.findDependentFields(medicalForm, 'systolic-bp');
//     console.log('Fields that depend on systolic-bp:', Array.from(systolicDependents));

//     console.log('\nField Execution Order:');
//     const executionOrder = FormUtils.getFieldExecutionOrder(medicalForm);
//     console.log(executionOrder);

//     // Demo 4: Complex Rule with Arrays
//     console.log('\n\nDemo 4: Complex Rules with Arrays');
//     console.log('---------------------------------');

//     const complexForm: Form = {
//         id: 'complex-form',
//         Name: 'Complex Rules Demo',
//         Fields: [
//             {
//                 FieldId: 'test-scores',
//                 Name: 'test-scores',
//                 Label: 'Test Scores',
//                 ResponseType: FieldResponseType.IntegerArray,
//                 Required: true,
//                 ValidateLogic: null,
//                 CalculateLogic: null,
//                 SkipLogic: null
//             },
//             {
//                 FieldId: 'average-score',
//                 Name: 'average-score',
//                 Label: 'Average Score',
//                 ResponseType: FieldResponseType.Float,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'avg-calc',
//                     Type: LogicType.Calculation,
//                     FieldId: 'average-score',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'calculate-avg',
//                             Name: 'Calculate average',
//                             Operation: {
//                                 id: 'avg-op',
//                                 Type: OperationType.FunctionExpression,
//                                 Expression: 'avg(scores)',
//                                 Variables: {
//                                     scores: { Type: OperandType.FieldReference, DataType: OperandDataType.Array, FieldId: 'test-scores' }
//                                 }
//                             }
//                         }
//                     ]
//                 }
//             },
//             {
//                 FieldId: 'passed',
//                 Name: 'passed',
//                 Label: 'Passed',
//                 ResponseType: FieldResponseType.Boolean,
//                 Required: false,
//                 CalculateLogic:
//                 {
//                     id: 'pass-check',
//                     Type: LogicType.Calculation,
//                     FieldId: 'passed',
//                     Enabled: true,
//                     Rules: [
//                         {
//                             id: 'check-pass',
//                             Name: 'Check if passed',
//                             Operation: {
//                                 id: 'pass-op',
//                                 Type: OperationType.Logical,
//                                 Operator: LogicalOperatorType.GreaterThanOrEqual,
//                                 Operands: [
//                                     { Type: OperandType.FieldReference, DataType: OperandDataType.Float, FieldId: 'average-score' },
//                                     { Type: OperandType.Constant, DataType: OperandDataType.Float, Value: 70 }
//                                 ]
//                             }
//                         }
//                     ]
//                 }
//             }
//         ]
//     };

//     const complexExecutor = new FormRuleExecutor(complexForm);
//     complexExecutor.setFieldValue('test-scores', [85, 92, 78, 88, 91]);
//     complexExecutor.executeAllFieldLogics();

//     console.log('Test Scores:', complexExecutor.getFieldValue('test-scores'));
//     console.log('Average Score:', complexExecutor.getFieldValue('average-score'));
//     console.log('Passed:', complexExecutor.getFieldValue('passed'));

//     // Demo 5: Advanced Form Example with Real-world Data (Age + Email)
//     console.log('\n\nDemo 5: Advanced Form Example with Real-world Data (Age + Email)');
//     console.log('------------------------------------------------------------------');
//     const advancedForm = createAdvancedFormExample3();
//     const advancedExecutor = new FormRuleExecutor(advancedForm);

//     // Test Case 1: Valid Adult Age + Valid Email
//     console.log('\nTest Case 1: Valid Adult Age (25) + Valid Email (gmail.com)');
//     advancedExecutor.setFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c', 25);
//     advancedExecutor.setFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b', 'john.doe@gmail.com');

//     const results1 = advancedExecutor.executeAllFieldLogics();
//     const ageFieldResults1 = results1.get('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const emailFieldResults1 = results1.get('c88c6869-2ee7-4888-8b5e-3002ed9ec24b');

//     console.log('Age Value:', advancedExecutor.getFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c'));
//     console.log('Age Validation Results:', ageFieldResults1);
//     console.log('Age Is Valid:', (ageFieldResults1?.validationErrors.length ?? 1) === 0);
//     console.log('Age Validation Errors:', ageFieldResults1?.validationErrors || []);

//     console.log('Email Value:', advancedExecutor.getFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b'));
//     console.log('Email Validation Results:', emailFieldResults1);
//     console.log('Email Is Valid:', (emailFieldResults1?.validationErrors.length ?? 1) === 0);
//     console.log('Email Validation Errors:', emailFieldResults1?.validationErrors || []);

//     // Test Case 2: Invalid Minor Age + Valid Email
//     console.log('\nTest Case 2: Invalid Minor Age (16) + Valid Email (gmail.com)');
//     advancedExecutor.setFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c', 16);
//     advancedExecutor.setFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b', 'teenager@gmail.com');

//     const results2 = advancedExecutor.executeAllFieldLogics();
//     const ageFieldResults2 = results2.get('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const emailFieldResults2 = results2.get('c88c6869-2ee7-4888-8b5e-3002ed9ec24b');

//     console.log('Age Value:', advancedExecutor.getFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c'));
//     console.log('Age Validation Results:', ageFieldResults2);
//     console.log('Age Is Valid:', (ageFieldResults2?.validationErrors.length ?? 1) === 0);
//     console.log('Age Validation Errors:', ageFieldResults2?.validationErrors || []);

//     console.log('Email Value:', advancedExecutor.getFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b'));
//     console.log('Email Validation Results:', emailFieldResults2);
//     console.log('Email Is Valid:', (emailFieldResults2?.validationErrors.length ?? 1) === 0);
//     console.log('Email Validation Errors:', emailFieldResults2?.validationErrors || []);

//     // Test Case 3: Valid Adult Age + Invalid Email
//     console.log('\nTest Case 3: Valid Adult Age (25) + Invalid Email (yahoo.com)');
//     advancedExecutor.setFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c', 25);
//     advancedExecutor.setFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b', 'user@yahoo.com');

//     const results3 = advancedExecutor.executeAllFieldLogics();
//     const ageFieldResults3 = results3.get('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const emailFieldResults3 = results3.get('c88c6869-2ee7-4888-8b5e-3002ed9ec24b');

//     console.log('Age Value:', advancedExecutor.getFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c'));
//     console.log('Age Validation Results:', ageFieldResults3);
//     console.log('Age Is Valid:', (ageFieldResults3?.validationErrors.length ?? 1) === 0);
//     console.log('Age Validation Errors:', ageFieldResults3?.validationErrors || []);

//     console.log('Email Value:', advancedExecutor.getFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b'));
//     console.log('Email Validation Results:', emailFieldResults3);
//     console.log('Email Is Valid:', (emailFieldResults3?.validationErrors.length ?? 1) === 0);
//     console.log('Email Validation Errors:', emailFieldResults3?.validationErrors || []);

//     // Test Case 4: Both Invalid - Minor Age + Invalid Email
//     console.log('\nTest Case 4: Both Invalid - Minor Age (16) + Invalid Email (yahoo.com)');
//     advancedExecutor.setFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c', 16);
//     advancedExecutor.setFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b', 'teenager@yahoo.com');

//     const results4 = advancedExecutor.executeAllFieldLogics();
//     const ageFieldResults4 = results4.get('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const emailFieldResults4 = results4.get('c88c6869-2ee7-4888-8b5e-3002ed9ec24b');

//     console.log('Age Value:', advancedExecutor.getFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c'));
//     console.log('Age Validation Results:', ageFieldResults4);
//     console.log('Age Is Valid:', (ageFieldResults4?.validationErrors.length ?? 1) === 0);
//     console.log('Age Validation Errors:', ageFieldResults4?.validationErrors || []);

//     console.log('Email Value:', advancedExecutor.getFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b'));
//     console.log('Email Validation Results:', emailFieldResults4);
//     console.log('Email Is Valid:', (emailFieldResults4?.validationErrors.length ?? 1) === 0);
//     console.log('Email Validation Errors:', emailFieldResults4?.validationErrors || []);

//     // Test Case 5: Edge Case - Exactly 18 + Valid Email
//     console.log('\nTest Case 5: Edge Case - Exactly 18 years old + Valid Email');
//     advancedExecutor.setFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c', 18);
//     advancedExecutor.setFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b', 'adult@gmail.com');

//     const results5 = advancedExecutor.executeAllFieldLogics();
//     const ageFieldResults5 = results5.get('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const emailFieldResults5 = results5.get('c88c6869-2ee7-4888-8b5e-3002ed9ec24b');

//     console.log('Age Value:', advancedExecutor.getFieldValue('81bdaaef-f6f2-4fe8-81f5-c29cdd56876c'));
//     console.log('Age Validation Results:', ageFieldResults5);
//     console.log('Age Is Valid:', (ageFieldResults5?.validationErrors.length ?? 1) === 0);
//     console.log('Age Validation Errors:', ageFieldResults5?.validationErrors || []);

//     console.log('Email Value:', advancedExecutor.getFieldValue('c88c6869-2ee7-4888-8b5e-3002ed9ec24b'));
//     console.log('Email Validation Results:', emailFieldResults5);
//     console.log('Email Is Valid:', (emailFieldResults5?.validationErrors.length ?? 1) === 0);
//     console.log('Email Validation Errors:', emailFieldResults5?.validationErrors || []);

//     // Test the form validation as a whole
//     console.log('\nOverall Form Validation:');
//     const formValidation = advancedExecutor.validateForm();
//     console.log('Form Valid:', formValidation.isValid);
//     console.log('Form Errors:', formValidation.errors);

//     // Test field dependencies
//     console.log('\nField Dependencies Analysis:');
//     const advancedAgeDependents = FormUtils.findDependentFields(advancedForm, '81bdaaef-f6f2-4fe8-81f5-c29cdd56876c');
//     const advancedEmailDependents = FormUtils.findDependentFields(advancedForm, 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b');
//     console.log('Fields that depend on age:', Array.from(advancedAgeDependents));
//     console.log('Fields that depend on email:', Array.from(advancedEmailDependents));

//     console.log('\nField Execution Order:');
//     const advancedExecutionOrder = FormUtils.getFieldExecutionOrder(advancedForm);
//     console.log(advancedExecutionOrder);

//     // Demo 6: Composite Email Validation Scenarios
//     console.log('\n\nDemo 6: Composite Email Validation Scenarios');
//     console.log('-------------------------------------------');
//     const emailForm = createCompositeEmailValidationForm();
//     const emailExec = new FormRuleExecutor(emailForm);

//     const emailField = 'c88c6869-2ee7-4888-8b5e-3002ed9ec24b';
//     const emails = [
//         'demo@gmail.com',                // should pass (no errors)
//         'prashantkharade@gmail.com',     // should fail (admin-like)
//         'john.doe@gmail.com',            // should fail
//         'prashant@gmail.com',            // contains "prashant" -> fail
//         'demo@xyz.com',                  // not gmail & not demo@gmail.com -> fail
//         'user@example.com',              // fail
//         'user@xyz.com',                  // fail (xyz domain)
//         'abc',                           // fail (short, contains abc)
//         'xyz',                           // fail (contains xyz only)
//         'abc@gmail.com',                 // fail (contains abc)
//         'xyz@gmail.com',                 // fail (contains xyz)
//         'testabc@gmail.com',             // fail (contains abc)
//         'admin@gmail.com'                // fail
//     ];

//     for (const e of emails) {
//         emailExec.setFieldValue(emailField, e);
//         const r = emailExec.executeFieldLogics(emailField);
//         console.log(`Email '${e}' -> errors:`, r.validationErrors);
//     }
// }

// // Run the demo
// if (require.main === module) {
//     runDemo();
// }

// export {
//     createMedicalAssessmentForm,
//     createFinancialCalculatorForm,
//     runDemo
// };
