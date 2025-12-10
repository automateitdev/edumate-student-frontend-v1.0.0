<script setup>
import { ref, onMounted, nextTick } from 'vue';
import axios from 'axios';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import html2pdf from 'html2pdf.js';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const { fetchInvoices } = usePaymentStore();
const { invoices, loading } = storeToRefs(usePaymentStore());
const { user } = storeToRefs(useAuthStore());

const showDialog = ref(false);
const selectedInvoice = ref(null);
const receiptRef = ref(null);
const selectedFormat = ref('a4'); // Default to 'A4 Double'
const studentId = localStorage.getItem('student_id');
const academicYearId = localStorage.getItem('academic_year_id');
const instituteLogo = localStorage.getItem('institute_logo');
const instituteName = localStorage.getItem('institute_name');
const departmentName = localStorage.getItem('department_name');
const base64Logo = ref(null);
const formatOptions = [
    { label: 'A5 Single', value: 'a5' },
    { label: 'A4 Double', value: 'a4' }
];

async function convertImageToBase64(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch image');
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error converting image to base64:', error);
        return null; // Fallback to null if conversion fails
    }
}

// async function fetchInvoices() {
//     try {
//         const response = await axios.get('api/payment-portal/payment-invoice-show', {});
//         invoices.value = response.data.payload.data.enlistment_list.data || [];
//         // Convert instituteLogo to base64 when invoices are fetched
//         if (instituteLogo) {
//             base64Logo.value = await convertImageToBase64(instituteLogo);
//         }
//     } catch (error) {
//         console.error('Failed to fetch invoices:', error);
//     }
// }

const getInvoices = async () => {
    const payload = {
        academic_year_id: academicYearId,
        student_id: studentId
    };
    await fetchInvoices(payload);
};

function viewInvoice(invoice) {
    selectedInvoice.value = invoice;
    showDialog.value = true;
}

async function downloadInvoice(invoice) {
    selectedInvoice.value = invoice;
    showDialog.value = true;
    await nextTick();

    const element = receiptRef.value;
    if (!element) return;

    const formatMap = {
        a5: { unit: 'mm', format: 'a5', orientation: 'portrait' },
        a4: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (!selectedFormat.value) return;

    // Ensure base64Logo is set before generating PDF
    if (!base64Logo.value && instituteLogo) {
        base64Logo.value = await convertImageToBase64(instituteLogo);
    }

    const opt = {
        margin: 5,
        filename: `${invoice.invoice}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: formatMap[selectedFormat.value],
        width: 1200, // 200mm at 96 DPI (200 * 96 / 25.4)
        windowWidth: 760
    };

    html2pdf().set(opt).from(element).save();
}

function printInvoice() {
    const printContent = receiptRef.value;
    if (!printContent) return;

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) return;

    printWindow.document.write(`<!DOCTYPE html>
    <html>
    <head>
      <title>Print Receipt</title>
      <style>
        body { font-family: 'Times New Roman', serif; font-size: 18px; margin: 20px; }
        ${document.querySelector('style')?.innerHTML || ''}
      </style>
    </head>
    <body>${printContent.innerHTML}</body></html>`);

    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
    };
}

function formatNumber(value) {
    return Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const fmtDate = (d) => {
    if (!d) return 'N/A';
    const dt = d instanceof Date ? d : new Date(d);
    if (isNaN(dt)) return 'N/A';
    return dt.toLocaleDateString('en-GB', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    });
};

const getSeverity = (state) => {
    console.log(state);
    switch (state) {
        case 'COMPLETED':
            return 'success';

        case 'PENDING':
            return 'warning';

        case 'INTENDED':
            return 'info';

        default:
            return 'danger';
    }
};

const getStatus = (state) => {
    console.log(state);
    switch (state) {
        case 'COMPLETED':
            return 'success';

        case 'PENDING':
            return 'pending';

        case 'INTENDED':
            return 'requested';

        default:
            return state;
    }
};

onMounted(() => {
    getInvoices();
});

useVisibilityChange(() => {
    getInvoices();
});
</script>

<template>
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
    <Card>
        <template #title>Payment Invoices</template>
        <template #content>
            <DataTable
                size="small"
                showGridlines
                stripedRows
                rowHover
                resizableColumns
                columnResizeMode="fit"
                :value="invoices"
                dataKey="id"
                class="shadow rounded-lg"
                :paginator="true"
                :rows="15"
                :rowsPerPageOptions="[15, 25, 50, 100]"
                :loading="loading"
            >
                <template #header>
                    <div class="flex flex-wrap gap-2 justify-content-start align-items-center">
                        <Dropdown v-model="selectedFormat" :options="formatOptions" optionLabel="label" optionValue="value" placeholder="Select pdf Format" v-if="invoices.length" />
                    </div>
                </template>
                <template #empty><Message severity="warn" :closable="false">No invoice loaded!</Message></template>
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
                <Column field="invoice" header="Invoice No" />
                <Column field="payment_date" header="Date">
                    <template #body="{ data }">
                        {{ fmtDate(data.payment_date) }}
                    </template>
                </Column>
                <Column field="pay_amount" header="Amount">
                    <template #body="{ data }">
                        {{ formatNumber(data.pay_amount) }}
                    </template>
                </Column>

                <Column field="payment_method" header="Method" />
                <Column header="Name">
                    <template #body="{ data }">
                        {{ data.pay_invoice_details[0]?.student_name ?? '-' }}
                    </template>
                </Column>

                <Column field="payment_state" header="Status">
                    <template #body="slotProps">
                        <Tag :value="getStatus(slotProps.data.payment_state)" :severity="getSeverity(slotProps.data.payment_state)" class="uppercase" />
                    </template>
                </Column>

                <Column header="Actions" v-if="invoices.some((invoice) => invoice.payment_state === 'COMPLETED')">
                    <template #body="{ data }">
                        <div v-if="data.payment_state === 'COMPLETED'">
                            <Button text rounded icon="pi pi-eye" severity="info" @click="viewInvoice(data)" />
                            <Button text rounded icon="pi pi-download" severity="success" @click="downloadInvoice(data)" :disabled="!selectedFormat" />
                        </div>
                    </template>
                </Column>
            </DataTable>
            <Dialog v-model:visible="showDialog" modal header="Invoice Details" class="w-[90vw] md:w-[50vw]" :dismissableMask="true" @hide="selectedInvoice = null">
                <div id="print-area" ref="receiptRef" class="receipt-root" v-if="selectedInvoice">
                    <div class="receipt-header">
                        <div class="logo-and-info">
                            <img :src="base64Logo" alt="Institute Logo" class="logo" />
                            <div class="text-info">
                                <div class="receipt-title">{{ instituteName }}</div>
                                <div class="receipt-address">--</div>
                            </div>
                        </div>
                    </div>
                    <div class="receipt-title-center">Money Receipt</div>

                    <div class="receipt-detail-cols">
                        <div>
                            <table class="details-table">
                                <tbody>
                                    <tr>
                                        <td>Student ID</td>
                                        <td>: {{ selectedInvoice.pay_invoice_details[0]?.custom_student_id ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td>Name</td>
                                        <td>: {{ selectedInvoice.pay_invoice_details[0]?.student_name ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td>Department</td>
                                        <td>: {{ departmentName ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td>Class-Shift-Section</td>
                                        <td>: {{ selectedInvoice.pay_invoice_details[0]?.class ?? '-' }} - {{ selectedInvoice.pay_invoice_details[0]?.shift ?? '-' }} - {{ selectedInvoice.pay_invoice_details[0]?.section ?? '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div>
                            <table class="details-table">
                                <tbody>
                                    <tr>
                                        <td>Invoice No</td>
                                        <td>: {{ selectedInvoice.invoice ?? '-' }}</td>
                                    </tr>
                                    <tr>
                                        <td>Payment Date</td>
                                        <td>: {{ fmtDate(selectedInvoice?.payment_date) }}</td>
                                    </tr>
                                    <tr>
                                        <td>Payment Method</td>
                                        <td>: {{ selectedInvoice.payment_method === 'QC' ? 'Manual' : selectedInvoice.payment_method ?? 'Online' }}</td>
                                    </tr>
                                    <tr>
                                        <td>Payment Status</td>
                                        <td>: {{ selectedInvoice.payment_state ?? '-' }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <table class="fee-table">
                        <thead>
                            <tr>
                                <th>Fee Head</th>
                                <th>Fee Sub Heads</th>
                                <th class="text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, idx) in selectedInvoice.pay_invoice_details" :key="idx">
                                <td>{{ item.fee_head ?? '-' }}</td>
                                <td>{{ item.fee_subhead ?? '-' }}</td>
                                <td class="text-right">{{ formatNumber(item.payment_amount) }}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" class="right bold">Total Paid</td>
                                <td class="text-right bold">{{ formatNumber(selectedInvoice.pay_amount) }}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div class="footer">
                        <div><strong>Powered By:</strong> Academy-Institute Management System</div>
                        <div><strong>Note:</strong> This Money Receipt was created on a software and is valid without signature and seal.</div>
                    </div>
                </div>
            </Dialog>
        </template>
    </Card>
</template>

<style scoped>
.receipt-root {
    max-width: 1120px;
    background: #ffffff;
    border: 2px solid #333;
    margin: 16px auto;
    padding: 12px 12px 0 12px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    position: relative;
    color: #000;
}

.receipt-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin-bottom: 5px;
}

.logo-and-info {
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.logo {
    width: 100px;
    height: auto;
    object-fit: contain;
}

.text-info {
    display: flex;
    flex-direction: column;
}

.receipt-title {
    font-size: 18px;
    font-weight: bold;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.receipt-address {
    font-size: 14px;
}

.receipt-title-center {
    text-align: center;
    font-weight: 600;
    font-size: 16px;
    margin: 6px 0;
    text-decoration: underline;
}

.receipt-detail-cols {
    display: flex;
    justify-content: space-between;
    margin-bottom: 12px;
}

.details-table {
    font-size: 13px;
    border: none;
    background: none;
}

.details-table td {
    padding: 2px 6px;
    vertical-align: top;
    border: none;
}

.fee-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 13px;
}

.fee-table th,
.fee-table td {
    border: 1px solid #000;
    padding: 6px 8px;
    background: #fff;
}

.fee-table th {
    background: #f5f5f5;
    font-weight: bold;
    font-size: 13px;
    text-align: center;
}

.text-right {
    text-align: right;
}

.right {
    text-align: right !important;
}

.bold {
    font-weight: bold;
}

/* Footer Table Style */
.footer {
    margin-top: 14px;
    font-size: 8px;
    display: flex;
    justify-content: space-between;
}
</style>
