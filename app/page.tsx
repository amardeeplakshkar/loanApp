"use client"
import { useState } from 'react';
import { differenceInMonths, differenceInDays } from 'date-fns';
import { useAuth, useUser } from '@clerk/nextjs'

export interface Loan {
  id: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  interestType: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  payments: Payment[];
}

export interface Payment {
  id: string;
  amount: number;
  date: Date;
}

export const calculateTotalInterest = (loan: Loan): number => {
  const totalMonths = differenceInMonths(loan.endDate, loan.startDate);
  const monthlyRate = getMonthlyInterestRate(loan);
  return (loan.principalAmount * monthlyRate * totalMonths) / 100;
};

export const getMonthlyInterestRate = (loan: Loan): number => {
  return loan.interestType === 'monthly'
    ? loan.interestRate
    : loan.interestType === 'quarterly'
      ? loan.interestRate / 3
      : loan.interestRate / 12;
};

export const calculateTotalAmount = (loan: Loan): number => {
  return loan.principalAmount + calculateTotalInterest(loan);
};

export const calculateRemainingAmount = (loan: Loan): number => {
  const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
  return calculateTotalAmount(loan) - totalPaid;
};

export const calculateDaysRemaining = (loan: Loan): number => {
  return differenceInDays(loan.endDate, new Date());
};

export const calculateProgress = (loan: Loan): number => {
  const totalPaid = loan.payments.reduce((sum, payment) => sum + payment.amount, 0);
  const totalAmount = calculateTotalAmount(loan);
  return (totalPaid / totalAmount) * 100;
};

export default function LoanManagementApp() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [form, setForm] = useState<Partial<Loan>>({ payments: [] });
  const [paymentForm, setPaymentForm] = useState<Partial<Payment>>({});
  const { user } = useUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: new Date(e.target.value) });
  };

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentForm({ ...paymentForm, [e.target.name]: e.target.value });
  };

  const handleAddLoan = () => {
    if (form.borrowerName && form.principalAmount && form.interestRate && form.startDate && form.endDate && form.interestType) {
      const newLoan: Loan = {
        id: `${Date.now()}`,
        borrowerName: form.borrowerName as string,
        principalAmount: Number(form.principalAmount),
        interestRate: Number(form.interestRate),
        interestType: form.interestType as 'monthly' | 'quarterly' | 'yearly',
        startDate: form.startDate as Date,
        endDate: form.endDate as Date,
        payments: [],
      };
      setLoans([...loans, newLoan]);
      setForm({ payments: [] });
    } else {
      alert('Please fill all fields.');
    }
  };

  const handleAddPayment = (loanId: string) => {
    if (paymentForm.amount && paymentForm.date) {
      const newPayment: Payment = {
        id: `${Date.now()}`,
        amount: Number(paymentForm.amount),
        date: new Date(paymentForm.date),
      };
      setLoans((prevLoans) =>
        prevLoans.map((loan) =>
          loan.id === loanId ? { ...loan, payments: [...loan.payments, newPayment] } : loan
        )
      );
      setPaymentForm({});
    } else {
      alert('Please fill all payment fields.');
    }
  };

  const handleEditLoan = (loanId: string, updatedLoan: Partial<Loan>) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) => (loan.id === loanId ? { ...loan, ...updatedLoan } : loan))
    );
  };

  const handleDeleteLoan = (loanId: string) => {
    setLoans((prevLoans) => prevLoans.filter((loan) => loan.id !== loanId));
  };

  const handleEditPayment = (loanId: string, paymentId: string, updatedPayment: Partial<Payment>) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) =>
        loan.id === loanId
          ? {
            ...loan,
            payments: loan.payments.map((payment) =>
              payment.id === paymentId ? { ...payment, ...updatedPayment } : payment
            ),
          }
          : loan
      )
    );
  };

  const handleDeletePayment = (loanId: string, paymentId: string) => {
    setLoans((prevLoans) =>
      prevLoans.map((loan) =>
        loan.id === loanId
          ? { ...loan, payments: loan.payments.filter((payment) => payment.id !== paymentId) }
          : loan
      )
    );
  };

  const {userId} = useAuth()

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <h1 className="text-3xl font-bold text-center text-blue-700">Loan Management Application</h1>
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-md p-6 my-6">
        <h2 className="text-2xl font-semibold mb-4">Add New Loan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          hello {user?.username}
          <br />
          {userId}
          <input
            name="borrowerName"
            placeholder="Borrower Name"
            className="border rounded p-2"
            onChange={handleInputChange}
          />
          <input
            name="principalAmount"
            placeholder="Principal Amount"
            type="number"
            className="border rounded p-2"
            onChange={handleInputChange}
          />
          <input
            name="interestRate"
            placeholder="Interest Rate (%)"
            type="number"
            className="border rounded p-2"
            onChange={handleInputChange}
          />
          <select
            name="interestType"
            className="border rounded p-2"
            onChange={handleInputChange}
          >
            <option value="">Select Interest Type</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            name="startDate"
            type="date"
            className="border rounded p-2"
            onChange={handleDateChange}
          />
          <input
            name="endDate"
            type="date"
            className="border rounded p-2"
            onChange={handleDateChange}
          />
        </div>
        <button
          onClick={handleAddLoan}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600"
        >
          Add Loan
        </button>
      </div>
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Loans</h2>
        {loans.map((loan) => (
          <div key={loan.id} className="bg-white shadow-md rounded-md p-6 mb-4">
            <h3 className="text-xl font-bold">{loan.borrowerName}</h3>
            <p>Principal Amount: {loan.principalAmount}</p>
            <p>Interest Rate: {loan.interestRate}%</p>
            <p>Total Interest: {calculateTotalInterest(loan)}</p>
            <p>Total Amount: {calculateTotalAmount(loan)}</p>
            <p>Remaining Amount: {calculateRemainingAmount(loan)}</p>
            <p>Days Remaining: {calculateDaysRemaining(loan)}</p>
            <p>Progress: {calculateProgress(loan).toFixed(2)}%</p>
            <h4 className="text-lg font-semibold mt-4">Payments</h4>
            {loan.payments.length > 0 ? (
              <ul className="list-disc pl-6">
                {loan.payments.map((payment) => (
                  <li key={payment.id}>
                    <div className="flex justify-between items-center">
                      <span>
                        Amount: {payment.amount} | Date: {payment.date.toDateString()}
                      </span>
                      <div>
                        <button
                          onClick={() =>
                            handleEditPayment(loan.id, payment.id, {
                              amount: Number(prompt('Enter new amount', String(payment.amount))),
                              date: new Date(
                                prompt('Enter new date (YYYY-MM-DD)', payment.date.toISOString().split('T')[0])!
                              ),
                            })
                          }
                          className="text-sm text-blue-500 hover:underline mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeletePayment(loan.id, payment.id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No payments recorded.</p>
            )}
            <div className="mt-4">
              <h4 className="text-lg font-semibold">Add Payment</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <input
                  name="amount"
                  placeholder="Payment Amount"
                  type="number"
                  className="border rounded p-2"
                  onChange={handlePaymentInputChange}
                />
                <input
                  name="date"
                  type="date"
                  className="border rounded p-2"
                  onChange={handlePaymentInputChange}
                />
              </div>
              <button
                onClick={() => handleAddPayment(loan.id)}
                className="bg-green-500 text-white px-4 py-2 rounded mt-2 hover:bg-green-600"
              >
                Add Payment
              </button>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  const updatedName = prompt('Enter new borrower name', loan.borrowerName ?? '') || undefined;
                  handleEditLoan(loan.id, { borrowerName: updatedName });
                }}
                className="text-sm text-blue-500 hover:underline mr-4"
              >
                Edit Loan
              </button>
              <button
                onClick={() => handleDeleteLoan(loan.id)}
                className="text-sm text-red-500 hover:underline"
              >
                Delete Loan
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

