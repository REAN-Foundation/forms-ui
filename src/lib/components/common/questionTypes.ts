
export type BasicTypes = {
    id: number;
    name: string;
    value: string;
    icon: string;
};

export type AdvanceTypes = {
    id: number;
    name: string;
    value: string;
    units: string[];
    icon: string;
    type: object
};


export const cards: BasicTypes[] = [
    {
        id: 1,
        name: 'Text',
        value: 'Text',
        icon: 'fluent:text-12-regular',
    },
    {
        id: 2,
        name: 'Float',
        value: 'Float',
        icon: 'mdi:decimal',
    },
    {
        id: 3,
        name: 'Integer',
        value: 'Integer',
        icon: 'carbon:string-integer',
    },
    {
        id: 4,
        name: 'Boolean',
        value: 'Boolean',
        icon: 'lucide:binary',
    },
    {
        id: 5,
        name: 'Object',
        value: 'Object',
        icon: 'ic:baseline-data-object',
    },
    {
        id: 6,
        name: 'TextArray',
        value: 'TextArray',
        icon: 'material-symbols:data-array',
    },
    {
        id: 7,
        name: 'MultiChoiceSelection',
        value: 'MultiChoiceSelection',
        icon: 'mdi:checkbox-outline',
    },
    {
        id: 8,
        name: 'SingleChoiceSelection',
        value: 'SingleChoiceSelection',
        icon: 'ph:radio-button-fill',
    },
    {
        id: 9,
        name: 'Date',
        value: 'Date',
        icon: 'uiw:date',
    },
    {
        id: 10,
        name: 'DateTime',
        value: 'DateTime',
        icon: 'formkit:datetime',
    },
    {
        id: 11,
        name: 'Rating',
        value: 'Rating',
        icon: 'ri:star-line',
    },
    {
        id: 12,
        name: 'Range',
        value: 'Range',
        icon: 'formkit:range',
    },
    // {
    //     id: 13,
    //     name: 'Location',
    //     value: 'Location',
    //     icon: 'pajamas:location',
    // },
    // {
    //     id: 14,
    //     name: 'File',
    //     value: 'File',
    //     icon: 'ph:file-duotone',
    // },
    // {
    //     id: 15,
    //     name: 'None',
    //     value: 'None',
    //     icon: '',

    // }
];

export const measurements: AdvanceTypes[] = [
    {
        id: 1,
        name: 'Temperature',
        value: 'Temperature',
        units: ['°C', '°F', 'K'],
        icon: 'hugeicons:temperature',
        type: {
            Oral: ' 36.1°C to 37.2°C (97°F to 99°F)',
            Rectal: '36.6°C to 37.8°C (97.9°F to 100.4°F)',
            Axillary: '35.5°C to 37.0°C (95.9°F to 98.6°F)'
        }
    },
    {
        id: 2,
        name: 'BloodPressure',
        value: 'BloodPressure',
        units: ['mmHg', 'kPa'],
        icon: 'healthicons:blood-pressure-monitor',
        type:
        {
            Systolic: 'under 120 mmHg',
            Distolic: 'above 80 mmHg'
        }
    },
    {
        id: 3,
        name: 'Glucose',
        value: 'Glucose',
        units: ['mg/dL', 'mmol/L'],
        icon: 'material-symbols:glucose',
        type:
        {
            Fasting: '70-99 mg/dL (3.9-5.5 mmol/L)',
            Non_Fasting: '< 140 mg/dL (7.8 mmol/L)'
        }
    },
    {
        id: 4,
        name: 'BloodOxygen',
        value: 'BloodOxygenSaturation',
        units: ['%'],
        icon: 'streamline:image-saturation-solid',
        type: {
            Normal: '5.7 %'
        }
    },
    {
        id: 5,
        name: 'PulseRate',
        value: 'PulseRate',
        units: ['bpm'],
        icon: 'streamline:heart-rate-pulse-graph',
        type: {
            Normal: '60-100 bpm'
        }
    },
    {
        id: 6,
        name: 'Hematocrit',
        value: 'Hematocrit',
        units: ['%'],
        icon: 'material-symbols:humidity-percentage-outline',
        type: {
            Men: '38.3% to 48.6%',
            Women: '35.5% to 44.9%'
        }
    },
    {
        id: 7,
        name: 'Cholesterol',
        value: 'Cholesterol',
        units: ['mg/dL', 'mmol/L'],
        icon: 'ph:feather',
        type:
        {
            Normal: 'min 200 mg/dL (5.2 mmol/L)',
            HDL_Cholesterol: {
                Men: 'min 40 mg/dL (1.0 mmol/L)',
                Women: 'min 50 mg/dL (1.3 mmol/L)',
            },
            LDL_Cholesterol: {
                Normal: ' min 100 mg/dL (2.6 mmol/L)',
            },
            Triglycerides: {
                Normal: 'min 150 mg/dL (1.7 mmol/L)'
            }
        }
    },
    {
        id: 8,
        name: 'Height',
        value: 'Height',
        units: ['cm,m,inch,feet'],
        icon: 'ic:outline-height',
        type: {}
    },
    {
        id: 9,
        name: 'Weight',
        value: 'Weight',
        units: ['kg,lbs'],
        icon: 'material-symbols:line-weight',
        type: {}
    },
    {
        id: 11,
        name: 'RespiratoryRate',
        value: 'RespiratoryRate',
        units: ['breaths/min'],
        icon: 'material-symbols:respiratory-rate-outline',
        type: {}
    },
    {
        id: 12,
        name: 'Electrolytes',
        value: 'Electrolytes',
        units: ['mmol/L', 'mEq/L'],
        icon: 'ph:flask-bold',
        type: {}
    },
    {
        id: 13,
        name: 'KidneyFunction',
        value: 'KidneyFunction',
        units: ['mL/min/1.73m²'],
        icon: 'healthicons:kidneys',
        type: {}
    },
    {
        id: 14,
        name: 'WaistCircumference',
        value: 'WaistCircumference',
        units: ['cm,inch'],
        icon: 'iconoir:waist',
        type:
        {
            Men: '< 94 cm (37 inches)',
            Women: '< 80 cm (31.5 inches)'
        }
    },
    {
        id: 15,
        name: 'HemoglobinA1C',
        value: 'HemoglobinA1C',
        units: ['%'],
        icon: 'material-symbols:bloodtype-outline',
        type: { Normal: 'min 5.7 %' }
    },
    {
        id: 16,
        name: 'Sleep',
        value: 'Sleep',
        units: ['Hr/night'],
        icon: 'mdi:sleep',
        type: {
            Adults: '7-9 hours',
            Teenagers: '8-10 hours',
            Children: ' 9-12 hours'
        }
    },

    {
        id: 17,
        // name: 'C-Reactive protein',
        name: 'CReactiveProtein',
        value: 'CReactiveProtein',
        units: ['mg/L'],
        icon: 'hugeicons:blockchain-03',
        type: {
            Normal: 'min 3 mg/L',
            Low: 'min 1 mg/L',
            Average: 'min 1-3 mg/L',
            High: 'min 3 mg/L'
        }
    },
    {
        id: 18,
        name: 'Lipoprotein',
        value: 'Lipoprotein',
        units: ['mg/dL', 'nmol/L'],
        icon: 'lets-icons:protein',
        type: {
            Normal: '< 30 mg/dL or < 75 nmol/L',
        }
    }
];
