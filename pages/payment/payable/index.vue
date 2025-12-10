<script setup>
import { storeToRefs } from 'pinia';
import { onMounted, ref, computed, reactive, watch } from 'vue';
import { usePaymentStore } from '~/stores/Payments';
import { useGeneralConfigStore } from '~/stores/GeneralConfigs';
import { useToast } from 'primevue/usetoast';
import dayjs from 'dayjs';
import { Tooltip } from 'chart.js';
const { isAuthenticated, institutes, user } = storeToRefs(useAuthStore());
const toast = useToast();
const expandedRows = ref({});
const selectedFeeheads = ref([]);
const selectedFeesubheads = ref({});

const { fetchPayableList, paymentRequest } = usePaymentStore();
const { getConfigs } = useGeneralConfigStore();
const { payableList, chargeList, chargeSetup, grandTotal, loading, isPaymentRequest } = storeToRefs(usePaymentStore());
const { fees_payment_by_web, student_online_payment_setting } = storeToRefs(useGeneralConfigStore());

const totalCalculatedAmount = computed(() => {
    let total = 0;

    for (const feeheadId in selectedFeesubheads.value) {
        const subheads = selectedFeesubheads.value[feeheadId];
        if (Array.isArray(subheads)) {
            for (const item of subheads) {
                const amount = item.partial_payment != null && !isNaN(item.partial_payment) ? Number(item.partial_payment) : Number(item.calculated_amount || 0);

                total += amount;
            }
        }
    }

    return total;
});

function getPayableAmount(rowId, amount_type) {
    const subheads = selectedFeesubheads.value[rowId];
    if (!Array.isArray(subheads)) return 0;

    return subheads
        .reduce((sum, subhead) => {
            let amount = 0;

            if (amount_type === 'calculated_amount') {
                const partial = subhead.partial_payment;
                if (partial !== undefined && partial !== null && partial !== '') {
                    amount = parseFloat(partial) || 0;
                } else {
                    amount = parseFloat(subhead.calculated_amount) || 0;
                }
            } else {
                amount = parseFloat(subhead[amount_type]) || 0;
            }

            return sum + amount;
        }, 0)
        .toFixed(2);
}

function getCurrentDue(data) {
    if (!data.partial_payment) return 0;
    data.current_due = parseFloat(data.calculated_amount) - parseFloat(data.partial_payment);
    return data.current_due;
}

const autoSelectedSubheads = ref({}); // NEW: stores unremovable defaults

const totalChargeAmount = ref(0);
onMounted(async () => {
    await getConfigs();
    await fetchPayableList();

    if (chargeList.value && Array.isArray(chargeList.value)) {
        totalChargeAmount.value = chargeList.value.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
    }

    const today = dayjs().format('YYYY-MM-DD');

    payableList.value.forEach((feeHead) => {
        const autoSelected = feeHead.fee_subheads.filter((subhead) => subhead.payable_date && (dayjs(subhead.payable_date).isSame(today, 'day') || dayjs(subhead.payable_date).isBefore(today, 'day')));

        autoSelectedSubheads.value[feeHead.id] = autoSelected;
        selectedFeesubheads.value[feeHead.id] = [...autoSelected]; // clone, not ref
    });
});

useVisibilityChange(async () => {
    await getConfigs();
    await fetchPayableList();

    const today = dayjs().format('YYYY-MM-DD');

    payableList.value.forEach((feeHead) => {
        const autoSelected = feeHead.fee_subheads.filter((subhead) => subhead.payable_date && (dayjs(subhead.payable_date).isSame(today, 'day') || dayjs(subhead.payable_date).isBefore(today, 'day')));

        autoSelectedSubheads.value[feeHead.id] = autoSelected;
        selectedFeesubheads.value[feeHead.id] = [...autoSelected]; // clone, not ref
    });
});

function onFeeSubheadChange(feeHeadId) {
    const locked = autoSelectedSubheads.value[feeHeadId] || [];
    const lockedIds = locked.map((item) => item.payapplies_id);

    const selected = selectedFeesubheads.value[feeHeadId] || [];

    const missingLocked = lockedIds.filter((id) => !selected.some((item) => item.payapplies_id === id));

    if (missingLocked.length > 0) {
        const added = selected.filter((item) => !lockedIds.includes(item.payapplies_id));
        selectedFeesubheads.value[feeHeadId] = [...locked, ...added];
    }
}

//  Enable This Part if need to keep rows not to be kept selected
const onFeeSubheadChangeAtDataTable = (feeHeadId, newSelection) => {
    if (student_online_payment_setting.value.toLowerCase() === 'due upto current date') {
        const autoSelected = autoSelectedSubheads.value[feeHeadId] || [];

        // Filter out any that were wrongly unselected
        const preserved = autoSelected.filter((auto) => !newSelection.some((sel) => sel.payapplies_id === auto.payapplies_id));

        // Merge preserved back
        const correctedSelection = [...newSelection, ...preserved];

        // Remove duplicates based on `payapplies_id`
        const uniqueSelection = correctedSelection.filter((item, index, self) => index === self.findIndex((i) => i.payapplies_id === item.payapplies_id));

        selectedFeesubheads.value[feeHeadId] = uniqueSelection;
    } else {
        selectedFeesubheads.value[feeHeadId] = newSelection;
    }
};

const isLockedRow = (feeHeadId, rowData) => {
    return autoSelectedSubheads.value[feeHeadId]?.some((item) => item.payapplies_id === rowData.payapplies_id);
};

// Watcher to ensure `input_amount` mirrors `calculated_amount` when subheads are selected
watch(
    payableList,
    (newVal) => {
        newVal.forEach((feeHead) => {
            feeHead.selectedSubheads?.forEach((sub) => {
                if (sub.input_amount === undefined) {
                    sub.input_amount = parseFloat(sub.calculated_amount) || 0;
                }
            });
        });
    },
    { deep: true, immediate: true }
);

const confirmPaymentDialog = ref(false);
const paymentData = reactive({
    payapplies_id: [],
    amount: []
});

const paymentConfirmation = () => {
    const allFeeHeads = Object.values(selectedFeesubheads.value); // array of arrays

    // Flatten and extract payapplies_id
    paymentData.payapplies_id = allFeeHeads.flatMap((feeHead) => feeHead.map((payapply) => payapply.payapplies_id));

    // Flatten and extract amount, preferring partial_payment if valid
    paymentData.amount = allFeeHeads.flatMap((feeHead) =>
        feeHead.map((payapply) => {
            return payapply.partial_payment != null && !isNaN(payapply.partial_payment) ? Number(payapply.partial_payment) : Number(payapply.calculated_amount || 0);
        })
    );

    confirmPaymentDialog.value = true;
};

const proceedPayment = async () => {
    const { status, message, payment_url, error } = await paymentRequest(paymentData);
    // console.log(success, message, payment_url);
    confirmPaymentDialog.value = false;
    if (status === 'success') {
        if (payment_url) {
            window.open(payment_url, '_self');
        } else {
            // Handle the case where payment_url is not provided
            console.error('Payment URL not provided:', message);
            // toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
        }
    } else {
        toast.add({ severity: 'error', summary: 'Error', detail: error, life: 5000 });
    }
};
</script>

<template>
    <div>
        <Card class="mb-3">
            <template #title>
                <div class="flex flex-wrap gap-4">
                    <p class="p-0 m-0 text-primary">{{ user.student_name }} (SID: {{ user.student_id }})</p>
                </div>
            </template>
            <template #content>
                <div class="flex flex-wrap justify-content-start align-items-top gap-4 capitalize">
                    <div>
                        <p class="p-0 m-0">Academic Year: {{ user.academic_year }}</p>
                        <p class="p-0 m-0">Department: {{ user.department_name }}</p>
                        <p class="p-0 m-0">Class-Shift-Section: {{ user.class_name }}-{{ user.shift }}-{{ user.section }}</p>
                    </div>

                    <div>
                        <p class="p-0 m-0">Group: {{ user.group }}</p>
                        <p class="p-0 m-0">Roll No: {{ user.roll }}</p>
                    </div>
                </div>
            </template>
        </Card>

        <Card v-if="fees_payment_by_web === 'yes'">
            <template #title>Payable List</template>
            <template #content>
                <DataTable :value="payableList" v-model:expandedRows="expandedRows" v-model:selection="selectedFeeheads" dataKey="id" size="small" scrollable striped-rows show-gridlines resizableColumns columnResizeMode="fit">
                    <template #empty> <Message severity="warn" :closable="false">No Data Found</Message> </template>
                    <template #header>
                        <div class="flex align-items-center justify-content-between gap-2">
                            <div class="flex gap-2">
                                <InlineMessage severity="info" v-if="totalCalculatedAmount > 0">Payment Amount: ৳ {{ totalCalculatedAmount }}</InlineMessage>
                                <InlineMessage severity="warn" v-if="totalCalculatedAmount <= 0">Select payment to pay</InlineMessage>
                                <Button label="Pay Now" icon="pi pi-wallet" :disabled="totalCalculatedAmount <= 0" @click="paymentConfirmation()" />
                            </div>
                        </div>
                    </template>
                    <template #loading>
                        <svg xmlns="http://www.w3.org/2000/svg" width="3em" height="3em" viewBox="0 0 24 24">
                            <g fill="none" stroke="rgb(237, 251, 251)" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
                                <path d="M3 12a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9" stroke-dasharray="18 18" stroke-dashoffset="18">
                                    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                                </path>

                                <path d="M17 12a5 5 0 1 0-5 5" stroke-dasharray="10 10" stroke-dashoffset="10">
                                    <animateTransform attributeName="transform" type="rotate" from="360 12 12" to="0 12 12" dur="1s" repeatCount="indefinite" fill="freeze" />
                                </path>
                            </g>
                        </svg>
                    </template>
                    <Column expander style="width: 5rem" />
                    <!-- <Column selectionMode="multiple" headerStyle="width: 3rem" frozen style="z-index: 100"> </Column> -->
                    <Column field="fee_head_name" header="Fee Head"></Column>
                    <Column field="fee_subheads" header="Fee Subhead">
                        <template #body="{ data }">
                            <div>
                                <div class="flex flex-wrap justify-content-start gap-3">
                                    <MultiSelect
                                        v-if="student_online_payment_setting?.toLowerCase() === 'due upto current date'"
                                        class="w-full"
                                        v-model="selectedFeesubheads[data.id]"
                                        :options="data.fee_subheads"
                                        optionLabel="feesubhead"
                                        placeholder="Select Fee Subheads"
                                        :maxSelectedLabels="3"
                                        :key="data.id + '-with-disable'"
                                        @change="onFeeSubheadChange(data.id)"
                                        :optionDisabled="(option) => autoSelectedSubheads[data.id]?.some((item) => item.payapplies_id === option.payapplies_id)"
                                    />

                                    <MultiSelect
                                        v-else
                                        class="w-full"
                                        v-model="selectedFeesubheads[data.id]"
                                        :options="data.fee_subheads"
                                        optionLabel="feesubhead"
                                        placeholder="Select Fee Subheads"
                                        :maxSelectedLabels="3"
                                        :key="data.id + '-no-disable'"
                                    />
                                </div>
                            </div>
                        </template>
                    </Column>
                    <Column field="fee_subheads" header="Total Payable">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'payable_amount') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <Column field="fee_subheads" header="Previous due">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'previous_due') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <Column field="fee_subheads" header="Fine">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'fine') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <Column field="fee_subheads" header="Waiver">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'waiver_amount') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <Column field="fee_subheads" header="Payment of">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'calculated_amount') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <Column field="fee_subheads" header="Total Due">
                        <template #body="{ data }">
                            <div v-if="selectedFeesubheads[data.id]">
                                {{ getPayableAmount(data.id, 'current_due') }}
                            </div>
                            <div v-else>0</div>
                        </template>
                    </Column>

                    <template #expansion="slotProps">
                        <div class="p-3">
                            <DataTable
                                dataKey="payapplies_id"
                                :value="slotProps.data.fee_subheads"
                                :selection="selectedFeesubheads[slotProps.data.id]"
                                @update:selection="(newSelection) => onFeeSubheadChangeAtDataTable(slotProps.data.id, newSelection)"
                                :selectableRow="(rowData) => !isLockedRow(slotProps.data.id, rowData)"
                                size="small"
                                resizableColumns
                                columnResizeMode="fit"
                            >
                                <Column selectionMode="multiple" headerStyle="width: 3rem"></Column>
                                <Column field="academic_year" header="Academic Year"></Column>
                                <Column field="feesubhead" header="Fee-Subhead"></Column>
                                <Column field="payable_date" header="Payable Date"></Column>
                                <Column field="payable_amount" header="Payable"></Column>
                                <Column field="previous_due" header="Previous Due"></Column>
                                <Column field="fine" header="Fine">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start align-items-center">
                                            <Button severity="warning" v-tooltip.top="'Added Fine'" :label="String(data.fine)" text class="w-full" icon="pi pi-plus-circle" v-if="Number(data.fine) > Number(data.fine_paid_amount)" />

                                            <Button severity="success" v-tooltip.top="'Paid Fine'" :label="String(data.fine)" text class="w-full" icon="pi pi-check-circle" v-else-if="Number(data.fine_paid_amount) === Number(data.fine)" />

                                            <span v-else>
                                                {{ data.fine }}
                                            </span>
                                        </div>
                                    </template>
                                </Column>
                                <Column field="waiver_amount" header="Waiver"></Column>
                                <Column field="calculated_amount" header="Payment of">
                                    <template #body="{ data }">
                                        <div class="flex justify-content-start align-items-center gap-2">
                                            <InputNumber class="w-full" style="min-width: 10rem" v-model="data.calculated_amount" disabled>{{ data.calculated_amount }}</InputNumber>
                                            <InputNumber
                                                class="w-full"
                                                style="min-width: 10rem"
                                                v-if="student_online_payment_setting?.toLowerCase() === 'partial payment on subhead'"
                                                v-model="data.partial_payment"
                                                placeholder="Partial Amount"
                                                :min="Math.max(data.fine - data.fine_paid_amount, 1)"
                                                :max="data.calculated_amount"
                                                :minFractionDigits="2"
                                                :maxFractionDigits="5"
                                                :value="data.calculated_amount"
                                                :disabled="!selectedFeesubheads[slotProps.data.id]?.some((item) => item.payapplies_id === data.payapplies_id)"
                                            />
                                        </div>
                                    </template>
                                </Column>
                                <Column field="current_due" header="Due Amount">
                                    <template #body="{ data }">
                                        <div v-if="selectedFeesubheads[slotProps.data.id]?.some((item) => item.payapplies_id === data.payapplies_id)">
                                            {{ getCurrentDue(data) }}
                                        </div>
                                        <div v-else>0</div>
                                    </template>
                                </Column>
                            </DataTable>
                        </div>
                    </template>
                </DataTable>
            </template>
        </Card>

        <div class="card-body" v-else>
            <Message severity="error" :closable="false">Sorry! Payment by web service unavailable !</Message>
        </div>
        <Dialog v-model:visible="confirmPaymentDialog" header="Payment Confirmation" :style="{ minWidth: '30rem', maxWidth: '45rem' }">
            <!-- <Button severity="warning" :label="'Payment of ৳ ' + totalCalculatedAmount" class="w-full" /> -->

            <InlineMessage severity="info" class="w-full"><p class="text-lg font-bold">Payment of: ৳ {{ totalCalculatedAmount }}</p></InlineMessage>


            <div v-if="chargeSetup && chargeList.length > 0">
                <!-- 💡 Percentage-based charge -->
                <InlineMessage severity="secondary" class="w-full" v-if="chargeSetup.calculation_type === 'percentage'">
                    <p class="text-xs">
                        {{ chargeSetup.title }} — {{ chargeSetup.amount }}% of total = ৳
                        {{ (totalCalculatedAmount * (chargeSetup.amount / 100)).toFixed(2) }}
                    </p>
                </InlineMessage>

                <!-- 💰 Fixed charge -->
                <div class="text-center my-2" v-else>
                    <InlineMessage severity="secondary" class="w-full">
                        <p class="text-xs">{{ chargeSetup.title }} : ৳ {{ totalChargeAmount }}</p>
                    </InlineMessage>
                </div>
            </div>

            <Message severity="warn" :closable="false">
                বিশেষ দ্রষ্টব্যঃ পেমেন্ট পোর্টালে প্রয়োজনীয় ধাপগুলো সম্পন্ন না করে থাকলে (যেমন: ব্রাউজার বন্ধ করে দেয়া / পোর্টাল থেকে ফিরে আসা), সংশ্লিষ্ট পেমেন্টটি ৩০ মিনিটের জন্য ‘PENDING’ অবস্থায় থাকবে। এই সময়ের মধ্যে উক্ত পেমেন্ট প্রক্রিয়া আর
                চালিয়ে নেওয়া সম্ভব হবে না।
            </Message>
            <Message severity="info" :closable="false">Clicking proceed will take you to the associated payment portal</Message>

            <div class="flex justify-content-end gap-2 my-3">
                <Button text label="Cancel" severity="secondary" @click="confirmPaymentDialog = false" :loading="loading" />
                <Button severity="info" label="Proceed" icon="pi pi-send" :disabled="!totalCalculatedAmount > 0" @click="proceedPayment()" :loading="loading || isPaymentRequest" />
            </div>
        </Dialog>
    </div>
</template>
