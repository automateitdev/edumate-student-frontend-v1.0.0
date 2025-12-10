import axios from 'axios';
import { defineStore } from 'pinia';

export const usePaymentStore = defineStore('Payments', {
  state: () => ({
    invoices: [],
    payableList: [],
    chargeSetup: null,
    chargeList: [],
    grandTotal: null,
    loading: false,
    isPaymentRequest: false,
    error: null,
  }),
  getters: {
    getPayables(state) {
      return state.payableList;
    },
  },
  actions: {
    async fetchPayableList(current = 1, perPage = 20) {
      // console.log(current, perPage);
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/api/payment-portal/payment-search', {
          page: current,
          per_page: perPage
        });
        this.chargeSetup = response.data?.payload?.data?.charge_setup ?? null;
        if (this.chargeSetup) {
          this.chargeList = response.data?.payload?.data?.all_charges ?? [];
        }
        const payments = response.data.payload.data.all_payments.processed_payments;
        this.payableList = payments.map(feeHead => ({
          ...feeHead,
          selectedSubheads: [], // Ensure selectedSubheads exists
          fee_subheads: feeHead.fee_subheads.map(subhead => ({
            ...subhead,
            due_amount: parseFloat(subhead.due_amount) || 0, // Ensure due_amount is valid
          })),
        }));
        this.grandTotal = response.data.payload.data.all_payments.grand_total;
      } catch (error) {
        this.error = error;
        // console.error('Error fetching Institutes:', error);
      } finally {
        this.loading = false;
      }
    },

    async paymentRequest(formData) {
      this.isPaymentRequest = true
      try {
        const response = await axios.post('/api/payment-portal/payment-create', formData);
        const { status, message, payment_url, error = null } = response.data.payload.data;
        return { status, message, payment_url };
      } catch (error) {
        if (error.response) {
          const errors =
            error.response?.data?.errors?.validation_error ??
            error.response?.data?.errors?.system_error ??
            error.response?.data?.errors?.request_error;
          const formattedErrors = (errors || []).map(err => `${err.message}`).join('\n');
          return { status: false, error: formattedErrors };
        } else {
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.isPaymentRequest = false;
      }
    },


    async fetchInvoices(payload) {
      this.loading = true
      try {
        const response = await axios.get('/api/payment-portal/payment-invoice-show', { params: payload });
        const { status, message, enlistment_list, error = null } = response.data.payload.data;
        if (status === 'success') {
          this.invoices = enlistment_list.data || [];
        }
      } catch (error) {
        if (error.response) {
          const errors =
            error.response?.data?.errors?.validation_error ??
            error.response?.data?.errors?.system_error ??
            error.response?.data?.errors?.request_error;
          const formattedErrors = (errors || []).map(err => `${err.message}`).join('\n');
          return { status: false, error: formattedErrors };
        } else {
          return { status: false, error: "Unexpected error occurred!" };
        }
      } finally {
        this.loading = false;
      }
    },
  },
});
