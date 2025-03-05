
import  BloodOxygenSaturationForm from "./advance/BloodOxygenSaturation.svelte";
import  BloodPressureForm from "./advance/BloodPressure.svelte";
import  CholesterolForm from "./advance/Cholesterol.svelte";
import  CReactiveProteinForm from "./advance/CReactiveProtein.svelte";
import  ElectrolytesForm from "./advance/Electrolytes.svelte";
import  GlucoseForm from "./advance/Glucose.svelte";
import  HeightForm from "./advance/Height.svelte";
import  HematocritForm from "./advance/Hematocrit.svelte";
import  HemoglobinForm from "./advance/Hemoglobin.svelte";
import  KidneyFunctionFaorm from "./advance/KidneyFunction.svelte";
import  LipoproteinForm from "./advance/Lipoprotein.svelte";
import  PulseRate from "./advance/PulseRate.svelte";
import  RespiratoryRateForm from "./advance/RespiratoryRate.svelte";
import  SleepForm from "./advance/Sleep.svelte";
import  TemperatureForm from "./advance/Temperature.svelte";
import  WaistForm from "./advance/Waist.svelte";
import  WeightForm from "./advance/Weight.svelte";

import  BooleanForm from "./basic/Boolean.svelte";
import  CheckboxForm from "./basic/CheckBox.svelte";
import  DateForm from "./basic/Date.svelte";
import  DateTimeForm from "./basic/DateTime.svelte";
import  FileForm from "./basic/File.svelte";
import  FloatForm from "./basic/Float.svelte";
import  IntegerForm from "./basic/Integer.svelte";
import  ObjectForm from "./basic/Object.svelte";
import  RadioForm from "./basic/Radio.svelte";
import  RatingForm from "./basic/Rating.svelte";
import  RangeForm from "./basic/Range.svelte";
import  TextArrayForm from "./basic/TextArray.svelte";
import  TextForm from "./basic/Text.svelte";
// /////////////////////////Basic types//////////////////////////////////////////////////////
// import {
//     IntegerForm,
//     FloatForm,
//     BooleanForm,
//     ObjectForm,
//     TextArrayForm,
//     RadioForm,
//     CheckboxForm,
//     FileForm,
//     DateTimeForm,
//     DateForm,
//     RatingForm,
//     RangeForm,
//     TextForm,
// } from '../forms/index';

// //////////////////////////Advance Types//////////////////////////////////////////////////////
// import {
//     BloodPressureForm,
//     TemperatureForm,
//     BloodOxygenSaturationForm,
//     GlucoseForm,
//     PulseRate,
//     HematocritForm,
//     LipoproteinForm,
//     CReactiveProteinForm,
//     SleepForm,
//     HemoglobinForm,
//     WaistForm,
//     KidneyFunctionForm,
//     ElectrolytesForm,
//     RespiratoryRateForm,
//     HeightForm,
//     CholesterolForm,
//     WeightForm
// } from '../forms/index';

export const formComponents = {
    Text: TextForm,
    Integer: IntegerForm,
    Float: FloatForm,
    Boolean: BooleanForm,
    Object: ObjectForm,
    TextArray: TextArrayForm,
    SingleChoiceSelection: RadioForm,
    MultiChoiceSelection: CheckboxForm,
    File: FileForm,
    Date: DateForm,
    DateTime: DateTimeForm,
    Rating: RatingForm,
    Range: RangeForm,

    Temperature: TemperatureForm,
    BloodPressure: BloodPressureForm,
    Glucose: GlucoseForm,
    BloodOxygenSaturation: BloodOxygenSaturationForm,
    PulseRate: PulseRate,
    Hematocrit: HematocritForm,
    Cholesterol: CholesterolForm,
    Height: HeightForm,
    Weight: WeightForm,
    RespiratoryRate: RespiratoryRateForm,
    Electrolytes: ElectrolytesForm,
    KidneyFunction: KidneyFunctionFaorm,
    WaistCircumference: WaistForm,
    HemoglobinA1C: HemoglobinForm,
    Sleep: SleepForm,
    CReactiveProtein: CReactiveProteinForm,
    Lipoprotein: LipoproteinForm,
    // None: ''
};