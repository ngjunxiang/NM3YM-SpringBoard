import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Message, SelectItem, MenuItem } from 'primeng/components/common/api';

import { ChecklistService } from '../../../../core/cm/checklist.service';

@Component({
    selector: 'cm-new-checklist',
    templateUrl: './cm-new-checklist.component.html',
    styleUrls: ['./cm-new-checklist.component.scss']
})

export class CMNewChecklistComponent implements OnInit {

    // UI Control
    loading = false;
    blocked = false;
    msgs: Message[] = [];
    tabs: MenuItem[];
    activeTab: number;
    dropdownData = {
        conditions: [],
        conditionOptions: []
    };
    complianceMOCols: any[];
    complianceCCols: any[];
    legalMOCols: any[];
    legalCCols: any[];
    docIndex: number;
    editMode = false;
    mDisplay = false;
    mEditDisplay = false;
    cDisplay = false;
    cEditDisplay = false;
    oDisplay = false;
    oEditDisplay = false;

    // UI Component
    newChecklistForm: FormGroup;
    complianceDocumentsForm: FormGroup;
    legalDocumentsForm: FormGroup;
    dialogForm: FormGroup;
    cDialogForm: FormGroup;
    checklist: any;

    constructor(
        private checklistService: ChecklistService,
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.loading = true;

        this.activeTab = 0;

        this.legalMOCols = [
            { field: 'documentName', header: 'Document Name' },
            { field: 'agmtCode', header: 'Agmt Code' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'signature', header: 'Signature Required' },
            { field: 'canWaiver', header: 'Can be Waivered' }
        ];

        this.legalCCols = [
            { field: 'documentName', header: 'Document Name' },
            { field: 'conditionName', header: 'Condition Name' },
            { field: 'conditionOptions', header: 'Condition Options' },
            { field: 'agmtCode', header: 'Agmt Code' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'signature', header: 'Signature Required' },
            { field: 'canWaiver', header: 'Can be Waivered' }
        ];

        this.complianceMOCols = [
            { field: 'documentName', header: 'Document Name' },
            { field: 'agmtCode', header: 'Agmt Code' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'signature', header: 'Signature Required' }
        ];

        this.complianceCCols = [
            { field: 'documentName', header: 'Document Name' },
            { field: 'conditionName', header: 'Condition Name' },
            { field: 'conditionOptions', header: 'Condition Options' },
            { field: 'agmtCode', header: 'Agmt Code' },
            { field: 'remarks', header: 'Remarks' },
            { field: 'signature', header: 'Signature Required' }
        ];

        this.createForm();
    }

    createForm() {
        this.newChecklistForm = this.fb.group({
            checklistName: new FormControl('', [Validators.required]),
            requiredFields: this.fb.array([
                this.fb.group({
                    fieldName: new FormControl('', Validators.required),
                })
            ]),
            conditions: this.fb.array([
                this.fb.group({
                    conditionName: new FormControl('', Validators.required),
                    conditionOptions: new FormControl('', Validators.required)
                })
            ])
        });

        this.complianceDocumentsForm = this.fb.group({
            mandatory: this.fb.array([]),
            conditional: this.fb.array([]),
            optional: this.fb.array([])
        });

        this.legalDocumentsForm = this.fb.group({
            mandatory: this.fb.array([]),
            conditional: this.fb.array([]),
            optional: this.fb.array([])
        });

        this.dialogForm = this.fb.group({
            documentName: new FormControl('', Validators.required),
            agmtCode: new FormControl('', Validators.required),
            signature: new FormControl(true),
            canWaiver: new FormControl(false),
            remarks: new FormControl('')
        });

        this.cDialogForm = this.fb.group({
            conditions: new FormArray([
                this.fb.group({
                    conditionName: new FormControl('', Validators.required),
                    conditionOption: new FormControl('', Validators.required)
                })
            ]),
            documentName: new FormControl('', Validators.required),
            agmtCode: new FormControl('', Validators.required),
            signature: new FormControl(true),
            canWaiver: new FormControl(false),
            remarks: new FormControl('')
        });

        this.loading = false;
    }

    addNewCondition() {
        let i = (+this.newChecklistForm.get('conditions')['length'] - 1) + '';

        this.newChecklistForm.get('conditions').get(i).get('conditionName').markAsDirty();
        this.newChecklistForm.get('conditions').get(i).get('conditionOptions').markAsDirty();

        if (this.newChecklistForm.get('conditions').get(i).get('conditionName').invalid ||
            this.newChecklistForm.get('conditions').get(i).get('conditionOptions').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please fill in the condition name and options before adding another condition'
            });
            return;
        }

        let control = <FormArray>this.newChecklistForm.controls.conditions;
        control.push(
            this.fb.group({
                conditionName: new FormControl('', Validators.required),
                conditionOptions: new FormControl('', Validators.required)
            })
        );
    }

    deleteCondition(index) {
        let control = <FormArray>this.newChecklistForm.controls.conditions;
        control.removeAt(index);
    }

    addNewField() {
        let i = (+this.newChecklistForm.get('requiredFields')['length'] - 1) + '';

        this.newChecklistForm.get('requiredFields').get(i).get('fieldName').markAsDirty();

        if (this.newChecklistForm.get('requiredFields').get(i).get('fieldName').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please fill in the field name before adding another field'
            });
            return;
        }

        let control = <FormArray>this.newChecklistForm.controls.requiredFields;
        control.push(
            this.fb.group({
                fieldName: new FormControl('', Validators.required)
            })
        );
    }

    deleteField(index) {
        let control = <FormArray>this.newChecklistForm.controls.requiredFields;
        control.removeAt(index);
    }

    showMDialog() {
        this.dialogForm = this.fb.group({
            documentName: new FormControl('', Validators.required),
            agmtCode: new FormControl('', Validators.required),
            signature: new FormControl(true),
            canWaiver: new FormControl(false),
            remarks: new FormControl('')
        });

        this.blocked = true;
        this.mDisplay = true;
    }

    addNewMandatory() {
        this.dialogForm.get('documentName').markAsDirty();
        this.dialogForm.get('agmtCode').markAsDirty();

        if (this.dialogForm.get('documentName').invalid ||
            this.dialogForm.get('agmtCode').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please correct the invalid fields highlighted'
            });
            return;
        }

        let control = <FormArray>this.complianceDocumentsForm.get('mandatory');

        if (this.activeTab === 1) {
            control = <FormArray>this.legalDocumentsForm.get('mandatory');
        }

        if (this.editMode) {
            control.get(this.docIndex + '').get('documentName').setValue(this.dialogForm.get('documentName').value);
            control.get(this.docIndex + '').get('agmtCode').setValue(this.dialogForm.get('agmtCode').value);
            control.get(this.docIndex + '').get('signature').setValue(this.dialogForm.get('signature').value);
            control.get(this.docIndex + '').get('canWaiver').setValue(this.dialogForm.get('canWaiver').value);
            control.get(this.docIndex + '').get('remarks').setValue(this.dialogForm.get('remarks').value);
            this.editMode = false;
            this.blocked = false;
            this.mEditDisplay = false;
            return;
        }

        control.push(this.dialogForm);

        this.mDisplay = false;
        this.blocked = false;
    }

    cancelAddNewMandatory() {
        this.editMode = false;
        this.mDisplay = false;
        this.mEditDisplay = false;
        this.blocked = false;
    }

    editMandatoryDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }

        this.dialogForm = this.fb.group({
            documentName: new FormControl(form.get('mandatory').get(index + '').get('documentName').value, Validators.required),
            agmtCode: new FormControl(form.get('mandatory').get(index + '').get('agmtCode').value, Validators.required),
            signature: new FormControl(form.get('mandatory').get(index + '').get('signature').value),
            canWaiver: new FormControl(form.get('mandatory').get(index + '').get('canWaiver').value),
            remarks: new FormControl(form.get('mandatory').get(index + '').get('remarks').value)
        });

        this.editMode = true;
        this.docIndex = index;
        this.blocked = true;
        this.mEditDisplay = true;
    }

    deleteMandatoryDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }

        let control = <FormArray>form.get('mandatory');
        control.removeAt(index);
    }

    showCDialog() {
        if (this.newChecklistForm.get('conditions')['length'] === 1
            && (this.newChecklistForm.get('conditions').get('0').get('conditionName').value == ''
                || this.newChecklistForm.get('conditions').get('0').get('conditionOptions').value == '')) {
            this.newChecklistForm.get('conditions').get('0').get('conditionName').markAsDirty();
            this.newChecklistForm.get('conditions').get('0').get('conditionOptions').markAsDirty();
            document.getElementById('conditions').scrollIntoView();
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please add a condition and condition options before adding new conditional document'
            });
            return;
        }
        
        this.cDialogForm = this.fb.group({
            conditions: new FormArray([
                this.fb.group({
                    conditionName: new FormControl('', Validators.required),
                    conditionOption: new FormControl('', Validators.required)
                })
            ]),
            documentName: new FormControl('', Validators.required),
            agmtCode: new FormControl('', Validators.required),
            signature: new FormControl(true),
            canWaiver: new FormControl(false),
            remarks: new FormControl('')
        });

        this.retrieveConditionalConditions();

        this.blocked = true;
        this.cDisplay = true;
    }

    retrieveConditionalConditions() {
        let conditions: SelectItem[] = [];
        for (let i = 0; i < this.newChecklistForm.get('conditions')['length']; i++) {
            if (this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value !== '') {
                conditions.push({
                    'label': this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value,
                    'value': this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value
                });
            }
        }
        this.dropdownData['conditions'] = conditions;
    }

    onConditionNameSelect(conditionName: string, index: number) {
        let conditionOptions: SelectItem[] = [];
        for (let i = 0; i < this.newChecklistForm.get('conditions')['length']; i++) {
            if (conditionName === this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value) {
                let options = this.newChecklistForm.get('conditions').get(i + '').get('conditionOptions').value.split(',');
                options.forEach(option => {
                    conditionOptions.push({
                        'label': option.trim(),
                        'value': option.trim()
                    });
                });
            }
        }
        this.dropdownData['conditionOptions'][index] = conditionOptions;
    }

    reloadConditionalConditionOptions(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }

        for (let i = 0; i < form.get('conditional').get(index + '').get('conditions')['length']; i++) {
            let control = form.get('conditional').get(index + '').get('conditions').get(i + '');
            this.onConditionNameSelect(control.get('conditionName').value, i);
        }
    }

    addNewConditionalCondition() {
        let i = (+this.cDialogForm.get('conditions')['length'] - 1) + '';

        this.cDialogForm.get('conditions').get(i).get('conditionName').markAsDirty();
        this.cDialogForm.get('conditions').get(i).get('conditionOption').markAsDirty();
        
        if (this.cDialogForm.get('conditions').get(i).get('conditionName').invalid ||
            this.cDialogForm.get('conditions').get(i).get('conditionOption').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please fill in the condition name and options using the dropdown menu before adding another condition'
            });
            return;
        }

        let control = <FormArray>this.cDialogForm.get('conditions');
        control.push(
            this.fb.group({
                conditionName: new FormControl('', Validators.required),
                conditionOption: new FormControl('', Validators.required)
            })
        );
    }

    deleteConditionalCondition(index) {
        let control = <FormArray>this.cDialogForm.get('conditions');
        control.removeAt(index);
    }

    addNewConditional() {
        let i = (+this.cDialogForm.get('conditions')['length'] - 1) + '';

        if (+i > 0 && this.cDialogForm.get('conditions').get(i).get('conditionName').value === ''
            && this.cDialogForm.get('conditions').get(i).get('conditionOption').value === '') {
            let control = <FormArray>this.cDialogForm.get('conditions');
            control.removeAt(+i);
            i = +i - 1 + '';
        }

        this.cDialogForm.get('conditions').get(i).get('conditionName').markAsDirty();
        this.cDialogForm.get('conditions').get(i).get('conditionOption').markAsDirty();
        this.cDialogForm.get('documentName').markAsDirty();
        this.cDialogForm.get('agmtCode').markAsDirty();

        if (this.cDialogForm.get('conditions').get(i).get('conditionName').invalid ||
            this.cDialogForm.get('conditions').get(i).get('conditionOption').invalid ||
            this.cDialogForm.get('documentName').invalid ||
            this.cDialogForm.get('agmtCode').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please correct the invalid fields highlighted'
            });
            return;
        }

        let control = <FormArray>this.complianceDocumentsForm.get('conditional');

        if (this.activeTab === 1) {
            control = <FormArray>this.legalDocumentsForm.get('conditional');
        }
        
        if (this.editMode) {
            control.get(this.docIndex + '').get('conditions').setValue(this.cDialogForm.get('conditions').value);
            control.get(this.docIndex + '').get('documentName').setValue(this.cDialogForm.get('documentName').value);
            control.get(this.docIndex + '').get('agmtCode').setValue(this.cDialogForm.get('agmtCode').value);
            control.get(this.docIndex + '').get('signature').setValue(this.cDialogForm.get('signature').value);
            control.get(this.docIndex + '').get('canWaiver').setValue(this.cDialogForm.get('canWaiver').value);
            control.get(this.docIndex + '').get('remarks').setValue(this.cDialogForm.get('remarks').value);
            this.editMode = false;
            this.blocked = false;
            this.cEditDisplay = false;
            return;
        }

        control.push(this.cDialogForm);

        this.dropdownData.conditionOptions = [];
        this.blocked = false;
        this.cDisplay = false;
    }

    cancelAddNewConditional() {
        this.editMode = false;
        this.dropdownData.conditionOptions = [];
        this.cEditDisplay = false;
        this.blocked = false;
        this.cDisplay = false;
    }

    editConditionalDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }
        
        this.cDialogForm = this.fb.group({
            conditions: new FormArray([]),
            documentName: new FormControl(form.get('conditional').get(index + '').get('documentName').value, Validators.required),
            agmtCode: new FormControl(form.get('conditional').get(index + '').get('agmtCode').value, Validators.required),
            signature: new FormControl(form.get('conditional').get(index + '').get('signature').value),
            canWaiver: new FormControl(form.get('conditional').get(index + '').get('canWaiver').value),
            remarks: new FormControl(form.get('conditional').get(index + '').get('remarks').value)
        });

        form.get('conditional').get(index + '').get('conditions')['controls'].forEach(control => {
            let arr = <FormArray>this.cDialogForm.get('conditions');
            arr.push(
                this.fb.group({
                    conditionName: new FormControl(control.get('conditionName').value, Validators.required),
                    conditionOption: new FormControl(control.get('conditionOption').value, Validators.required)
                })
            );
        });

        this.reloadConditionalConditionOptions(index);

        this.docIndex = index;
        this.editMode = true;
        this.blocked = true;
        this.cEditDisplay = true;
    }

    deleteConditionalDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }

        let control = <FormArray>form.get('conditional');
        control.removeAt(index);
    }

    showODialog() {
        this.dialogForm = this.fb.group({
            documentName: new FormControl('', Validators.required),
            agmtCode: new FormControl('', Validators.required),
            signature: new FormControl(true),
            canWaiver: new FormControl(false),
            remarks: new FormControl('')
        });

        this.blocked = true;
        this.oDisplay = true;
    }

    addNewOptional() {
        this.dialogForm.get('documentName').markAsDirty();
        this.dialogForm.get('agmtCode').markAsDirty();

        if (this.dialogForm.get('documentName').invalid ||
            this.dialogForm.get('agmtCode').invalid) {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please correct the invalid fields highlighted'
            });
            return;
        }

        let control = <FormArray>this.complianceDocumentsForm.get('optional');

        if (this.activeTab === 1) {
            control = <FormArray>this.legalDocumentsForm.get('optional');
        }

        if (this.editMode) {
            control.get(this.docIndex + '').get('documentName').setValue(this.dialogForm.get('documentName').value);
            control.get(this.docIndex + '').get('agmtCode').setValue(this.dialogForm.get('agmtCode').value);
            control.get(this.docIndex + '').get('signature').setValue(this.dialogForm.get('signature').value);
            control.get(this.docIndex + '').get('canWaiver').setValue(this.dialogForm.get('canWaiver').value);
            control.get(this.docIndex + '').get('remarks').setValue(this.dialogForm.get('remarks').value);
            this.editMode = false;
            this.blocked = false;
            this.oEditDisplay = false;
            return;
        }

        control.push(this.dialogForm);

        this.blocked = false;
        this.oDisplay = false;
    }

    cancelAddNewOptional() {
        this.editMode = false;
        this.oDisplay = false;
        this.blocked = false;
        this.oEditDisplay = false;
    }

    editOptionalDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }
        
        this.dialogForm = this.fb.group({
            documentName: new FormControl(form.get('optional').get(index + '').get('documentName').value, Validators.required),
            agmtCode: new FormControl(form.get('optional').get(index + '').get('agmtCode').value, Validators.required),
            signature: new FormControl(form.get('optional').get(index + '').get('signature').value),
            canWaiver: new FormControl(form.get('optional').get(index + '').get('canWaiver').value),
            remarks: new FormControl(form.get('optional').get(index + '').get('remarks').value)
        });

        this.editMode = true;
        this.docIndex = index;
        this.blocked = true;
        this.oEditDisplay = true;
    }

    deleteOptionalDoc(index: number) {
        let form = this.complianceDocumentsForm;

        if (this.activeTab === 1) {
            form = this.legalDocumentsForm;
        }

        let control = <FormArray>form.get('optional');
        control.removeAt(index);
    }

    changeTab(event) {
        this.activeTab = event.index;
    }

    createChecklist() {
        this.checklist = {};
        if (this.newChecklistForm.controls.checklistName.invalid) {
            document.getElementById('checklistName').scrollIntoView();
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: 'Please enter the checklist name'
            });
            return;
        }

        // Checklist Name
        this.checklist['name'] = this.newChecklistForm.get('checklistName').value;
        
        // Checklist Required Fields
        this.checklist['requiredFields'] = [];

        for (let i = 0; i < this.newChecklistForm.get('requiredFields')['length']; i++) {
            if (!(this.newChecklistForm.get('requiredFields')['length'] - 1 === i
                && this.newChecklistForm.get('requiredFields').get(i + '').get('fieldName').value === '')) {
                this.checklist['requiredFields'].push(this.newChecklistForm.get('requiredFields').get(i + '').get('fieldName').value);
            }
        }

        // Checklist Conditions
        this.checklist['conditions'] = {};

        for (let i = 0; i < this.newChecklistForm.get('conditions')['length']; i++) {
            if (!(this.newChecklistForm.get('conditions')['length'] - 1 === i
                && (this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value === ''
                    || this.newChecklistForm.get('conditions').get(i + '').get('conditionOptions').value === ''))) {
                let conditionName = this.newChecklistForm.get('conditions').get(i + '').get('conditionName').value;
                let conditionOptionsArr = this.newChecklistForm.get('conditions').get(i + '').get('conditionOptions').value.split(',');
                this.checklist['conditions'][conditionName] = [];
                conditionOptionsArr.forEach(option => {
                    this.checklist['conditions'][conditionName].push(option.trim());
                });
            }
        }


        // Compliance Documents
        this.checklist['complianceDocuments'] = {};
        this.checklist['complianceDocuments']['mandatory'] = [];

        for (let i = 0; i < this.complianceDocumentsForm.get('mandatory')['length']; i++) {
            let mandatoryDoc = this.complianceDocumentsForm.get('mandatory').get(i + '');
            this.checklist['complianceDocuments']['mandatory'].push({
                documentName: mandatoryDoc.get('documentName').value,
                agmtCode: mandatoryDoc.get('agmtCode').value,
                signature: mandatoryDoc.get('signature').value,
                remarks: mandatoryDoc.get('remarks').value
            });
        }

        this.checklist['complianceDocuments']['conditional'] = [];

        for (let i = 0; i < this.complianceDocumentsForm.get('conditional')['length']; i++) {
            let conditionalDoc = this.complianceDocumentsForm.get('conditional').get(i + '');
            let conditions = [];
            for (let j = 0; j < this.complianceDocumentsForm.get('conditional').get(i + '').get('conditions')['length']; j++) {
                let condition = this.complianceDocumentsForm.get('conditional').get(i + '').get('conditions').get(j + '');
                conditions.push({
                    conditionName: condition.get('conditionName').value,
                    conditionOption: condition.get('conditionOption').value
                })
            }
            this.checklist['complianceDocuments']['conditional'].push({
                conditions: conditions,
                documentName: conditionalDoc.get('documentName').value,
                agmtCode: conditionalDoc.get('agmtCode').value,
                signature: conditionalDoc.get('signature').value,
                remarks: conditionalDoc.get('remarks').value
            });
        }

        this.checklist['complianceDocuments']['optional'] = [];

        for (let i = 0; i < this.complianceDocumentsForm.get('optional')['length']; i++) {
            let optionalDoc = this.complianceDocumentsForm.get('optional').get(i + '');
            this.checklist['complianceDocuments']['optional'].push({
                documentName: optionalDoc.get('documentName').value,
                agmtCode: optionalDoc.get('agmtCode').value,
                signature: optionalDoc.get('signature').value,
                remarks: optionalDoc.get('remarks').value
            });
        }

        // Legal Documents
        this.checklist['legalDocuments'] = {};
        this.checklist['legalDocuments']['mandatory'] = [];

        for (let i = 0; i < this.legalDocumentsForm.get('mandatory')['length']; i++) {
            let mandatoryDoc = this.legalDocumentsForm.get('mandatory').get(i + '');
            this.checklist['legalDocuments']['mandatory'].push({
                documentName: mandatoryDoc.get('documentName').value,
                agmtCode: mandatoryDoc.get('agmtCode').value,
                signature: mandatoryDoc.get('signature').value,
                canWaiver: mandatoryDoc.get('canWaiver').value,
                remarks: mandatoryDoc.get('remarks').value
            });
        }

        this.checklist['legalDocuments']['conditional'] = [];

        for (let i = 0; i < this.legalDocumentsForm.get('conditional')['length']; i++) {
            let conditionalDoc = this.legalDocumentsForm.get('conditional').get(i + '');
            let conditions = [];
            for (let j = 0; j < this.legalDocumentsForm.get('conditional').get(i + '').get('conditions')['length']; j++) {
                let condition = this.legalDocumentsForm.get('conditional').get(i + '').get('conditions').get(j + '');
                conditions.push({
                    conditionName: condition.get('conditionName').value,
                    conditionOption: condition.get('conditionOption').value
                })
            }
            this.checklist['legalDocuments']['conditional'].push({
                conditions: conditions,
                documentName: conditionalDoc.get('documentName').value,
                agmtCode: conditionalDoc.get('agmtCode').value,
                signature: conditionalDoc.get('signature').value,
                canWaiver: conditionalDoc.get('canWaiver').value,
                remarks: conditionalDoc.get('remarks').value
            });
        }

        this.checklist['legalDocuments']['optional'] = [];

        for (let i = 0; i < this.legalDocumentsForm.get('optional')['length']; i++) {
            let optionalDoc = this.legalDocumentsForm.get('optional').get(i + '');
            this.checklist['legalDocuments']['optional'].push({
                documentName: optionalDoc.get('documentName').value,
                agmtCode: optionalDoc.get('agmtCode').value,
                signature: optionalDoc.get('signature').value,
                canWaiver: optionalDoc.get('canWaiver').value,
                remarks: optionalDoc.get('remarks').value
            });
        }

        this.checklistService.createChecklist(this.checklist).subscribe(res => {
            if (res.error) {
                this.msgs.push({
                    severity: 'error', summary: 'Error', detail: res.error
                });
            }

            this.msgs.push({
                severity: 'success', summary: 'Success', detail: 'Checklist created <br> You will be redirected shortly'
            });

            setTimeout(() => {
                this.router.navigate(['/cm/checklist/manage']);
            }, 5000);
        }, error => {
            this.msgs.push({
                severity: 'error', summary: 'Error', detail: error
            });
        });
    }
}