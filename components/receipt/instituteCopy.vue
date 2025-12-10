<script setup>
import { ref, onMounted, computed } from 'vue';
import QRCode from 'qrcode';

const schoolName = 'A. K. School & College';
const address = '616, Dania, Dhaka 1236';
const session = 2025;
const studentId = '2877624';
const rollNo = 50;
const studentName = 'MD. AFIEAN';
const className = 'SEVEN';
const group = 'General';
const section = 'H';
const mobileNo = '01716990651';
const paymentDate = '28/05/2025';
const receiptNo = '25052810061700083';
const paymentType = 'Cash';
const fees = [{ particular: 'Tution Fees > May', totalDue: 800, fineDue: 0, discount: 0, paid: 800, balance: 0 }];
const inWord = 'Taka Eight Hundred Only';
const remarks = '';
const collectorName = 'MOHAMMAD SHAKHAOATH HOSSAIN';
const accountantName = '';
const watermarkSrc = '/paid-watermark.png'; // <-- Put your watermark here if needed
const logoSrc = '/school-logo.png'; // <-- Optional

const qrSrc = ref('');

onMounted(async () => {
    qrSrc.value = await QRCode.toDataURL(receiptNo);
});

const total = computed(() => fees.reduce((sum, f) => sum + f.paid, 0));

function formatNumber(value) {
    return Number(value).toFixed(2);
}
</script>

<template>
    <div class="receipt-root">
        <img v-if="watermarkSrc" :src="watermarkSrc" alt="PAID Watermark" class="receipt-watermark" />
        <div class="receipt-header">
            <div class="receipt-logo-block">
                <img v-if="logoSrc" :src="logoSrc" class="receipt-logo" alt="Logo" />
                <div>
                    <div class="receipt-title">{{ schoolName }}</div>
                    <div class="receipt-address">{{ address }}</div>
                </div>
            </div>
            <img v-if="qrSrc" :src="qrSrc" alt="QR Code" class="receipt-qr" />
            <div class="receipt-paid-stamp">
                <img v-if="watermarkSrc" :src="watermarkSrc" alt="PAID" />
            </div>
            <div class="receipt-copy">Institute Copy</div>
        </div>
        <div class="receipt-bar">Money Receipt</div>
        <div class="receipt-session">Session: {{ session }}</div>
        <div class="receipt-detail-row">
            <table class="receipt-details-table">
                <tbody>
                    <tr>
                        <td><b>Student ID</b></td>
                        <td>: {{ studentId }}</td>
                    </tr>
                    <tr>
                        <td><b>Roll No</b></td>
                        <td>: {{ rollNo }}</td>
                    </tr>
                    <tr>
                        <td><b>Student Name</b></td>
                        <td>: {{ studentName }}</td>
                    </tr>
                    <tr>
                        <td><b>Class</b></td>
                        <td>: {{ className }}</td>
                    </tr>
                    <tr>
                        <td><b>Group</b></td>
                        <td>: {{ group }}</td>
                    </tr>
                    <tr>
                        <td><b>Section</b></td>
                        <td>: {{ section }}</td>
                    </tr>
                    <tr>
                        <td><b>Mobile No.</b></td>
                        <td>: {{ mobileNo }}</td>
                    </tr>
                    <tr>
                        <td><b>Payment Date</b></td>
                        <td>: {{ paymentDate }}</td>
                    </tr>
                    <tr>
                        <td><b>Receipt No.</b></td>
                        <td>: {{ receiptNo }}</td>
                    </tr>
                    <tr>
                        <td><b>Payment Type</b></td>
                        <td>: {{ paymentType }}</td>
                    </tr>
                </tbody>
            </table>
            <div class="receipt-detail-right">
                <table class="receipt-details-table">
                    <tbody>
                        <tr>
                            <td><b>Student ID</b></td>
                            <td>: {{ studentId }}</td>
                        </tr>
                        <tr>
                            <td><b>Roll No</b></td>
                            <td>: {{ rollNo }}</td>
                        </tr>
                        <tr>
                            <td><b>Student Name</b></td>
                            <td>: {{ studentName }}</td>
                        </tr>
                        <tr>
                            <td><b>Class</b></td>
                            <td>: {{ className }}</td>
                        </tr>
                        <tr>
                            <td><b>Group</b></td>
                            <td>: {{ group }}</td>
                        </tr>
                        <tr>
                            <td><b>Section</b></td>
                            <td>: {{ section }}</td>
                        </tr>
                        <tr>
                            <td><b>Mobile No.</b></td>
                            <td>: {{ mobileNo }}</td>
                        </tr>
                        <tr>
                            <td><b>Payment Date</b></td>
                            <td>: {{ paymentDate }}</td>
                        </tr>
                        <tr>
                            <td><b>Receipt No.</b></td>
                            <td>: {{ receiptNo }}</td>
                        </tr>
                        <tr>
                            <td><b>Payment Type</b></td>
                            <td>: {{ paymentType }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <table class="receipt-fee-table">
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
        <div class="receipt-signatures">
            <div>
                <div class="receipt-signature-line">{{ collectorName }}</div>
                <div>Collected By</div>
            </div>
            <div>
                <div class="receipt-signature-line">{{ accountantName }}</div>
                <div>Accountant Signature</div>
            </div>
        </div>
    </div>
</template>

<style>
.receipt-root {
    font-family: Arial, sans-serif;
    font-size: 13px;
    background: #fff;
    border: 1.5px solid #111;
    max-width: 600px;
    margin: 30px auto;
    padding: 10px 10px 0 10px;
    position: relative;
    box-sizing: border-box;
}
.receipt-watermark {
    position: absolute;
    left: 50%;
    top: 38%;
    transform: translate(-50%, -50%);
    width: 230px;
    opacity: 0.13;
    pointer-events: none;
    z-index: 0;
}
.receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.receipt-logo-block {
    display: flex;
    align-items: center;
    gap: 10px;
}
.receipt-logo {
    width: 38px;
    height: 38px;
}
.receipt-title {
    font-weight: bold;
    font-size: 17px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.receipt-address {
    font-size: 13px;
    margin-top: 1px;
}
.receipt-copy {
    font-size: 12px;
    font-weight: 600;
    margin-top: 4px;
}
.receipt-bar {
    background: #7e7efc;
    color: #fff;
    font-weight: bold;
    font-size: 15px;
    text-transform: uppercase;
    text-align: center;
    padding: 6px 0 4px 0;
    margin: 8px 0 0 0;
    border-top: 1.2px solid #111;
    border-bottom: 1.2px solid #111;
    letter-spacing: 1.2px;
}
.receipt-session {
    text-align: right;
    font-size: 13px;
    font-weight: 600;
    margin-bottom: 2px;
    margin-top: 3px;
}
.receipt-detail-row {
    display: flex;
    border: 1.2px solid #111;
    border-top: none;
    border-bottom: none;
    width: 100%;
}
.receipt-details-table {
    width: 56%;
    font-size: 13px;
    border-collapse: collapse;
}
.receipt-details-table td {
    padding: 2px 4px;
    vertical-align: top;
    white-space: nowrap;
}
.receipt-detail-right {
    width: 44%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    min-height: 110px;
    padding: 12px 0 0 0;
}
.receipt-qr {
    width: 97px;
    height: 97px;
    border: 1.2px solid #666;
    background: #fff;
}
.receipt-paid-stamp img {
    display: block;
    width: 128px;
    margin-top: -80px;
    margin-left: 15px;
    opacity: 0.13;
    pointer-events: none;
    position: absolute;
    left: 0;
    top: 36px;
}
.receipt-fee-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin-bottom: 0;
    margin-top: 0;
}
.receipt-fee-table th,
.receipt-fee-table td {
    border: 1.2px solid #111;
    padding: 3px 5px;
    text-align: right;
    background: #fff;
}
.receipt-fee-table th {
    background: #f5f5f5;
    font-weight: bold;
    text-align: left;
}
.receipt-fee-table td.text-left {
    text-align: left;
}
.receipt-fee-table th:first-child,
.receipt-fee-table td:first-child {
    text-align: center;
}
.receipt-fee-table tfoot .bold {
    font-weight: bold;
}
.in-word {
    text-align: left;
}
.receipt-signatures {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 10px;
    font-size: 13px;
}
.receipt-signature-line {
    border-bottom: 1.2px solid #111;
    min-width: 220px;
    display: inline-block;
    font-weight: bold;
    font-size: 13px;
    margin-bottom: 2px;
}
@media print {
    .receipt-root {
        box-shadow: none !important;
    }
}
</style>
