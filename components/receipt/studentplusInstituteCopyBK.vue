<script setup>
import { ref, onMounted, computed } from 'vue';
import QRCode from 'qrcode';

const receiptData = {
    schoolName: 'A. K. School & College',
    address: '616, Dania, Dhaka 1236',
    session: 2025,
    studentId: '2877624',
    rollNo: '50',
    studentName: 'MD. AFIEAN',
    className: 'SEVEN',
    group: 'General',
    section: 'H',
    mobileNo: '01716990651',
    paymentDate: '28/05/2025',
    receiptNo: '25052810061700083',
    paymentType: 'Cash',
    fees: [{ particular: 'Tution Fees > May', totalDue: 800, fineDue: 0, discount: 0, paid: 800, balance: 0 }],
    inWord: 'Taka Eight Hundred Only',
    remarks: '',
    collectorName: 'MOHAMMAD SHAKHAOATH HOSSAIN',
    accountantName: '',
    watermarkSrc: '' // Set watermark if needed
};

const qrSrc = ref(['', '']);
onMounted(async () => {
    // One QR code for both, but generate for each
    const src = await QRCode.toDataURL(receiptData.receiptNo);
    qrSrc.value = [src, src];
});

function formatNumber(value) {
    return Number(value).toFixed(2);
}

const copies = [{ label: 'Institute Copy' }, { label: "Student's Copy" }];
</script>

<template>
    <div class="receipt-row">
        <div class="receipt-card" v-for="(copy, idx) in copies" :key="copy.label">
            <!-- Header -->
            <div class="receipt-header">
                <div class="school-info">
                    <!-- <img class="school-logo" src="..." alt="logo"> -->
                    <div>
                        <div class="school-title">{{ receiptData.schoolName }}</div>
                        <div>{{ receiptData.address }}</div>
                    </div>
                </div>
                <div class="copy-label">
                    <div>{{ copy.label }}</div>
                    <!-- <span class="session-label">Session: {{ receiptData.session }}</span> -->
                    <img v-if="qrSrc[idx]" :src="qrSrc[idx]" class="qr-img" alt="QR Code" />
                </div>
            </div>

            <div class="money-title-bar">Money Receipt</div>

            <div class="details-table-row">
                <div class="details-left">
                    <table class="details-table-inner">
                        <tbody>
                            <tr>
                                <td><b>Student ID</b></td>
                                <td>: {{ receiptData.studentId }}</td>
                            </tr>
                            <tr>
                                <td><b>Roll No</b></td>
                                <td>: {{ receiptData.rollNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Student Name</b></td>
                                <td>: {{ receiptData.studentName }}</td>
                            </tr>
                            <tr>
                                <td><b>Class</b></td>
                                <td>: {{ receiptData.className }}</td>
                            </tr>
                            <tr>
                                <td><b>Group</b></td>
                                <td>: {{ receiptData.group }}</td>
                            </tr>
                            <tr>
                                <td><b>Section</b></td>
                                <td>: {{ receiptData.section }}</td>
                            </tr>
                            <tr>
                                <td><b>Mobile No.</b></td>
                                <td>: {{ receiptData.mobileNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Payment Date</b></td>
                                <td>: {{ receiptData.paymentDate }}</td>
                            </tr>
                            <tr>
                                <td><b>Receipt No.</b></td>
                                <td>: {{ receiptData.receiptNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Payment Type</b></td>
                                <td>: {{ receiptData.paymentType }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="details-left">
                    <!-- <img v-if="receiptData.watermarkSrc" :src="receiptData.watermarkSrc" class="paid-watermark" alt="PAID" /> -->

                    <table class="details-table-inner">
                        <tbody>
                            <tr>
                                <td><b>Student ID</b></td>
                                <td>: {{ receiptData.studentId }}</td>
                            </tr>
                            <tr>
                                <td><b>Roll No</b></td>
                                <td>: {{ receiptData.rollNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Student Name</b></td>
                                <td>: {{ receiptData.studentName }}</td>
                            </tr>
                            <tr>
                                <td><b>Class</b></td>
                                <td>: {{ receiptData.className }}</td>
                            </tr>
                            <tr>
                                <td><b>Group</b></td>
                                <td>: {{ receiptData.group }}</td>
                            </tr>
                            <tr>
                                <td><b>Section</b></td>
                                <td>: {{ receiptData.section }}</td>
                            </tr>
                            <tr>
                                <td><b>Mobile No.</b></td>
                                <td>: {{ receiptData.mobileNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Payment Date</b></td>
                                <td>: {{ receiptData.paymentDate }}</td>
                            </tr>
                            <tr>
                                <td><b>Receipt No.</b></td>
                                <td>: {{ receiptData.receiptNo }}</td>
                            </tr>
                            <tr>
                                <td><b>Payment Type</b></td>
                                <td>: {{ receiptData.paymentType }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <table class="fees-table">
                <thead>
                    <tr>
                        <th>SL</th>
                        <th>Fee Head / Particulars</th>
                        <th>Total Due</th>
                        <th>Fine Due</th>
                        <th>Discount</th>
                        <th>Paid</th>
                        <th>Balance(Due)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(fee, i) in receiptData.fees" :key="i">
                        <td>{{ i + 1 }}</td>
                        <td style="text-align: left">{{ fee.particular }}</td>
                        <td>{{ formatNumber(fee.totalDue) }}</td>
                        <td>{{ formatNumber(fee.fineDue) }}</td>
                        <td>{{ formatNumber(fee.discount) }}</td>
                        <td>{{ formatNumber(fee.paid) }}</td>
                        <td>{{ formatNumber(fee.balance) }}</td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="5"></td>
                        <td style="font-weight: 600">Total :</td>
                        <td>{{ formatNumber(receiptData.fees.reduce((s, f) => s + f.paid, 0)) }}</td>
                    </tr>
                    <tr class="inword-row">
                        <td colspan="4">
                            In Word: <b>{{ receiptData.inWord }}</b>
                        </td>
                        <td colspan="3">Remarks: {{ receiptData.remarks }}</td>
                    </tr>
                </tfoot>
            </table>

            <div class="signature-row">
                <div class="sig-block">
                    <div class="sig-name">{{ receiptData.collectorName }}</div>
                    <div class="sig-label">Collected By</div>
                </div>
                <div class="sig-block">
                    <div class="sig-name">{{ receiptData.accountantName }}</div>
                    <div class="sig-label">Accountant Signature</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.receipt-row {
    display: flex;
    justify-content: center;
    gap: 32px;
    background: #fff;
    padding: 24px 0;
}
.receipt-card {
    width: 600px;
    border: 1.2px solid #111;
    background: #fff;
    padding: 10px 10px 0 10px;
    position: relative;
    font-family: Arial, sans-serif;
    font-size: 12px;
}
.receipt-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.school-info {
    display: flex;
    align-items: center;
    gap: 12px;
}
.school-title {
    font-weight: bold;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}
.copy-label {
    font-size: 11px;
    font-weight: 600;
    margin-top: 4px;
}
.money-title-bar {
    background: #7e7efc;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
    text-align: center;
    padding: 4px 0;
    margin: 8px 0 0 0;
    border-top: 1.2px solid #111;
    border-bottom: 1.2px solid #111;
}
.details-table-row {
    display: flex;
    width: 100%;
    border: 1.2px solid #111;
    border-top: none;
}
.details-left {
    width: 56%;
    padding: 0;
    border-right: 1.2px solid #111;
}
.details-table-inner {
    width: 100%;
    border-collapse: collapse;
}
.details-table-inner td {
    padding: 1px 2px;
    vertical-align: top;
}
.details-right {
    width: 44%;
    padding: 10px 0 0 0;
    text-align: center;
    position: relative;
    min-height: 120px;
}
.paid-watermark {
    position: absolute;
    left: 13%;
    top: 20%;
    opacity: 0.16;
    width: 170px;
    pointer-events: none;
    z-index: 0;
}
.qr-session-row {
    position: relative;
    z-index: 1;
}
.session-label {
    display: block;
    text-align: right;
    font-weight: 600;
    margin-bottom: 8px;
    margin-right: 14px;
    font-size: 12px;
}
.qr-img {
    width: 98px;
    height: 98px;
    border: 1.2px solid #666;
    margin: 0 auto;
    background: #fff;
}
.fees-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 0;
    margin-bottom: 0;
    font-size: 12px;
}
.fees-table th,
.fees-table td {
    border: 1.2px solid #555;
    padding: 2px 4px;
    text-align: right;
    background: #fff;
}
.fees-table th {
    background: #f5f5f5;
    font-weight: bold;
    text-align: left;
}
.fees-table th:first-child,
.fees-table td:first-child {
    text-align: center;
}
.inword-row td {
    border-top: 1.2px solid #555;
    background: #fff;
    font-size: 11px;
    padding-top: 6px;
    text-align: left;
}
.signature-row {
    display: flex;
    justify-content: space-between;
    margin-top: 24px;
    margin-bottom: 10px;
}
.sig-block {
    width: 48%;
    text-align: center;
}
.sig-name {
    border-bottom: 1.2px solid #111;
    display: inline-block;
    min-width: 220px;
    font-weight: bold;
    font-size: 12px;
}
.sig-label {
    margin-top: 2px;
    font-size: 12px;
}
</style>
