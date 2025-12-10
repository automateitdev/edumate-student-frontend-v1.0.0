<script setup>
import { ref, onMounted, computed } from 'vue';
import QRCode from 'qrcode';

const schoolName = "KRISHNAKUMARI CITY CORP. GIRL'S SCHOOL";
const address = 'Nandan Kanan, Jubilee Road, Kotwali, Chattogram';
const academicYear = 2025;
const studentId = '2381347';
const studentName = 'Apushree Das';
const invoiceId = 'AE221215041347250211162817';
const academicSession = 'N/A';
const rollNo = 47;
const classShiftSection = 'Nine-Morning-B BS';
const paymentDate = '2025-02-11';
const qrValue = invoiceId;

const fees = [
    { head: 'CCC Miscellaneous', subHead: 'CCC Miscellaneous', amount: 2200, waiver: 0, fine: 0, previousPaid: 0, paymentOf: 2200 },
    { head: 'School Miscellaneous', subHead: 'School Miscellaneous', amount: 300, waiver: 0, fine: 0, previousPaid: 0, paymentOf: 300 }
];

const note = 'Online Fees Payment';
const paidInWord = 'Two Thousand Five Hundred';

const qrSrc = ref('');
onMounted(async () => {
    qrSrc.value = await QRCode.toDataURL(qrValue);
});

const totalPayable = computed(() => fees.reduce((sum, f) => sum + Number(f.amount), 0));
const totalPaid = computed(() => fees.reduce((sum, f) => sum + Number(f.paymentOf), 0));
const dueAmount = computed(() => totalPayable.value - totalPaid.value);

function formatNumber(value) {
    return Number(value).toLocaleString();
}
</script>
<template>
    <div class="receipt-root">
        <div class="receipt-header">
            <div>
                <div class="receipt-title">{{ schoolName }}</div>
                <div class="receipt-address">{{ address }}</div>
            </div>
            <div>
                <img v-if="qrSrc" :src="qrSrc" class="qr-image" alt="QR" />
            </div>
        </div>
        <div class="receipt-title-center">Money Receipt</div>
        <div class="receipt-detail-cols">
            <div>
                <table class="details-table">
                    <tbody>
                        <tr>
                            <td>Academic Year</td>
                            <td>: {{ academicYear }}</td>
                        </tr>
                        <tr>
                            <td>Student ID</td>
                            <td>: {{ studentId }}</td>
                        </tr>
                        <tr>
                            <td>Name</td>
                            <td>: {{ studentName }}</td>
                        </tr>
                        <tr>
                            <td>Invoice ID</td>
                            <td>: {{ invoiceId }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                <table class="details-table">
                    <tbody>
                        <tr>
                            <td>Academic Session</td>
                            <td>: {{ academicSession }}</td>
                        </tr>
                        <tr>
                            <td>Roll No</td>
                            <td>: {{ rollNo }}</td>
                        </tr>
                        <tr>
                            <td>Class-Shift-Section</td>
                            <td>: {{ classShiftSection }}</td>
                        </tr>
                        <tr>
                            <td>Payment Date</td>
                            <td>: {{ paymentDate }}</td>
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
                    <th>Fee Amount</th>
                    <th>Waiver</th>
                    <th>Fine</th>
                    <th>Previous Paid</th>
                    <th>Payment of</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(fee, idx) in fees" :key="idx">
                    <td>{{ fee.head }}</td>
                    <td>{{ fee.subHead }}</td>
                    <td class="text-right">{{ formatNumber(fee.amount) }}</td>
                    <td class="text-right">{{ formatNumber(fee.waiver) }}</td>
                    <td class="text-right">{{ formatNumber(fee.fine) }}</td>
                    <td class="text-right">{{ formatNumber(fee.previousPaid) }}</td>
                    <td class="text-right">{{ formatNumber(fee.paymentOf) }}</td>
                </tr>
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="2" class="bold left">Note:</td>
                    <td colspan="5" class="left">{{ note }}</td>
                </tr>
                <tr>
                    <td colspan="6" class="right bold">Total Payable</td>
                    <td class="right bold">{{ formatNumber(totalPayable) }}</td>
                </tr>
                <tr>
                    <td colspan="6" class="right bold">Total Paid</td>
                    <td class="right bold">{{ formatNumber(totalPaid) }}</td>
                </tr>
                <tr>
                    <td colspan="6" class="right bold bottom">Due Amount</td>
                    <td class="right bold bottom">{{ formatNumber(dueAmount) }}</td>
                </tr>
            </tfoot>
        </table>
        <div class="paid-word-row"><span class="bold">Paid In Word:</span> {{ paidInWord }}</div>
        <div class="footer">
            <span>Powered By: Academy-Institute Management System</span>
            <span>Special Note: This Money Receipt was created on a software and is valid without signature and seal.</span>
        </div>
    </div>
</template>
<style scoped>
.receipt-root {
    max-width: 1120px;
    background: #ffffff;
    border: 2px solid #333;
    margin: 16px auto;
    padding: 12px 12px 0 12px;
    font-family: 'Times New Roman', serif;
    font-size: 18px;
    position: relative;
}
.receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 5px;
}
.receipt-title {
    font-size: 1.45em;
    font-weight: bold;
    text-align: left;
    text-transform: uppercase;
    letter-spacing: 1px;
}
.receipt-address {
    font-size: 1.07em;
}
.qr-image {
    width: 80px;
    height: 80px;
    margin-right: 6px;
    margin-top: 2px;
}
.receipt-title-center {
    text-align: center;
    font-weight: 600;
    font-size: 1.13em;
    margin-bottom: 7px;
    margin-top: 2px;
    text-decoration: underline;
}
.receipt-detail-cols {
    display: flex;
    justify-content: space-between;
    margin-bottom: 4px;
}
.details-table {
    font-size: 1em;
    border: none;
    background: none;
}
.details-table td {
    padding: 1px 6px 1px 0;
    border: none;
    vertical-align: top;
    background: none;
}
.fee-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 0px;
    font-size: 1.04em;
}
.fee-table th,
.fee-table td {
    border: 2px solid #888;
    padding: 2px 7px;
    background: #ffffff;
}
.fee-table th {
    background: #ffffff;
    font-weight: bold;
    font-size: 1.04em;
    text-align: center;
}
.text-right {
    text-align: right;
}
.left {
    text-align: left !important;
}
.right {
    text-align: right !important;
}
.bold {
    font-weight: bold;
}
.bottom {
    border-bottom: 3px double #222 !important;
}
.paid-word-row {
    font-size: 1.12em;
    padding: 7px 2px 2px 2px;
    font-weight: normal;
    border-bottom: 2px solid #bbb;
    margin-bottom: 0;
}
.footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.97em;
    color: #223;
    margin: 4px 0 7px 0;
}
@media print {
    .receipt-root {
        margin: 0 !important;
        box-shadow: none !important;
        border: 2px solid #333 !important;
    }
}
</style>
