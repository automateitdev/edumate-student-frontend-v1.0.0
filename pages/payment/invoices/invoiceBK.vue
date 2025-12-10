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

const { user } = storeToRefs(useAuthStore());

const invoices = ref([]);
const showDialog = ref(false);
const selectedInvoice = ref(null);
const receiptRef = ref(null);
const selectedFormat = ref(null);
const studentId = localStorage.getItem('student_id');
const academicYearId = localStorage.getItem('academic_year_id');
const instituteLogo = localStorage.getItem('institute_logo');
const instituteName = localStorage.getItem('institute_name');
const departmentName = localStorage.getItem('department_name');
// const studentId = user.student_id;
// const academicYearId = user.academic_year_id;
// const instituteLogo = user.institute_logo;
// const instituteName = user.institute_name;
// const departmentName = user.department_name;
const base64Logo = ref(null);
const formatOptions = [
    { label: 'A5 Single', value: 'a5' },
    { label: 'A4 Double', value: 'a4' },
    { label: '58mm POS', value: 'pos' }
];

async function convertImageToBase64(url) {
    try {
        const response = await fetch(url);
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

async function fetchInvoices() {
    try {
        const response = await axios.get('api/payment-portal/payment-invoice-show', {
            params: {
                academic_year_id: academicYearId,
                student_id: studentId
            }
        });
        invoices.value = response.data.payload.data.enlistment_list.data || [];
        // Convert instituteLogo to base64 when invoices are fetched
        if (instituteLogo) {
            base64Logo.value = await convertImageToBase64(instituteLogo);
        }
    } catch (error) {
        console.error('Failed to fetch invoices:', error);
    }
}

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
        a4: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pos: { unit: 'mm', format: [58, 200], orientation: 'portrait' }
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

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString();
}

onMounted(() => {
    fetchInvoices();
});
</script>

<template>
    <div class="p-6">
        <h2 class="text-2xl font-bold mb-4">Invoices</h2>

        <div class="flex gap-4 mb-4">
            <Dropdown v-model="selectedFormat" :options="formatOptions" optionLabel="label" optionValue="value" placeholder="Select Format" class="w-60" />
            <!-- <Button 
        label="Print" 
        icon="pi pi-print" 
        severity="info" 
        @click="printInvoice" 
        :disabled="!selectedFormat || !selectedInvoice" 
      /> -->
        </div>

        <DataTable :value="invoices" dataKey="id" class="shadow rounded-lg" :paginator="true" :rows="10" responsiveLayout="scroll">
            <Column field="invoice" header="Invoice No" />
            <Column field="payment_date" header="Date" />
            <Column field="pay_amount" header="Amount" />
            <Column field="payment_state" header="Status" />
            <Column field="payment_method" header="Method" />
            <Column header="Student">
                <template #body="{ data }">
                    {{ data.pay_invoice_details[0]?.student_name ?? '-' }}
                </template>
            </Column>
            <Column header="Actions">
                <template #body="{ data }">
                    <div class="flex gap-2">
                        <Button label="View" icon="pi pi-eye" severity="primary" size="small" @click="viewInvoice(data)" />
                        <Button label="Download" icon="pi pi-download" severity="success" size="small" @click="downloadInvoice(data)" :disabled="!selectedFormat" />
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
                                    <td>: {{ selectedInvoice.pay_invoice_details[0].custom_student_id }}</td>
                                </tr>
                                <tr>
                                    <td>Name</td>
                                    <td>: {{ selectedInvoice.pay_invoice_details[0]?.student_name ?? '-' }}</td>
                                </tr>
                                <tr>
                                    <td>Department</td>
                                    <td>:{{ departmentName }}</td>
                                </tr>
                                <tr>
                                    <td>Class-Shift-Section</td>
                                    <td>: {{ selectedInvoice.pay_invoice_details[0]?.class ?? '-' }} - {{ selectedInvoice.pay_invoice_details[0]?.section ?? '-' }} - {{ selectedInvoice.pay_invoice_details[0]?.shift ?? '-' }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table class="details-table">
                            <tbody>
                                <tr>
                                    <td>Invoice No</td>
                                    <td>: {{ selectedInvoice.invoice }}</td>
                                </tr>
                                <tr>
                                    <td>Payment Date</td>
                                    <td>: {{ formatDate(selectedInvoice.payment_date) }}</td>
                                </tr>
                                <tr>
                                    <td>Payment Method</td>
                                    <td>: {{ selectedInvoice.payment_method === 'QC' ? 'Manual' : selectedInvoice.payment_method }}</td>
                                </tr>
                                <tr>
                                    <td>Payment Status</td>
                                    <td>: {{ selectedInvoice.payment_state }}</td>
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
                            <td>{{ item.fee_head }}</td>
                            <td>{{ item.fee_subhead }}</td>
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
                    <table style="width: 100%; margin-top: 20px; font-size: 12px; border: 1px solid #000; border-collapse: collapse">
                        <tbody>
                            <tr>
                                <td style="text-align: left; padding: 8px; border: 1px solid #000"><strong>Powered By:</strong> Academy-Institute Management System</td>
                                <td style="text-align: right; padding: 8px; border: 1px solid #000">
                                    <span style="display: flex; justify-content: flex-start"><strong>Note:</strong></span
                                    >This Money Receipt was created on a software and is valid without signature and seal.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    &nbsp;&nbsp;&nbsp;
                </div>
            </div>
        </Dialog>
    </div>
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
    margin-top: 12px;
    padding: auto;
}

.footer table {
    width: 100%;
    border: 1px solid #000;
    border-collapse: collapse;
    font-size: 5px;
}

.footer td {
    padding: 8px;
    border: 1px solid #000;
    vertical-align: top;
}

.footer td strong {
    display: block;
    font-weight: 600;
    margin-bottom: 2px;
}
</style>
