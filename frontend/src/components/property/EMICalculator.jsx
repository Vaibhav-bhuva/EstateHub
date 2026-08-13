import React, { useState, useEffect } from 'react';
import { formatPrice } from '../../utils/formatters';

export default function EMICalculator({ propertyPrice }) {
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(20);
  const [emi, setEmi] = useState(0);

  useEffect(() => {
    // E = P * r * (1 + r)^n / ((1 + r)^n - 1)
    const principal = propertyPrice - (propertyPrice * (downPaymentPct / 100));
    const monthlyRate = interestRate / 12 / 100;
    const totalMonths = loanTenure * 12;

    if (principal > 0 && monthlyRate > 0 && totalMonths > 0) {
      const emiValue = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                       (Math.pow(1 + monthlyRate, totalMonths) - 1);
      setEmi(emiValue);
    } else {
      setEmi(0);
    }
  }, [propertyPrice, downPaymentPct, interestRate, loanTenure]);

  const downPaymentAmount = propertyPrice * (downPaymentPct / 100);
  const loanAmount = propertyPrice - downPaymentAmount;
  const totalPayment = emi * (loanTenure * 12);
  const totalInterest = totalPayment - loanAmount;

  return (
    <div className="glass-card p-6 border border-gray-100 shadow-sm rounded-2xl">
      <h3 className="text-xl font-bold text-gray-900 mb-6">EMI Calculator</h3>
      
      <div className="space-y-6">
        {/* Down Payment Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Down Payment ({downPaymentPct}%)</label>
            <span className="text-sm font-bold text-primary-700">{formatPrice(downPaymentAmount)}</span>
          </div>
          <input 
            type="range" 
            min="0" max="100" 
            value={downPaymentPct}
            onChange={(e) => setDownPaymentPct(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Interest Rate (% p.a.)</label>
          <div className="relative">
            <input 
              type="number" 
              step="0.1"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              className="input-field w-full"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">%</span>
          </div>
        </div>

        {/* Loan Tenure Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-semibold text-gray-700">Loan Tenure</label>
            <span className="text-sm font-bold text-primary-700">{loanTenure} Years</span>
          </div>
          <input 
            type="range" 
            min="1" max="30" 
            value={loanTenure}
            onChange={(e) => setLoanTenure(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
          />
        </div>

        {/* Results */}
        <div className="bg-primary-50 rounded-xl p-5 border border-primary-100 mt-6">
          <p className="text-sm text-primary-800 font-medium text-center mb-1">Estimated Monthly EMI</p>
          <p className="text-3xl font-black text-primary-900 text-center mb-4">{formatPrice(emi)}</p>
          
          <div className="grid grid-cols-2 gap-4 border-t border-primary-200 pt-4 mt-2">
            <div>
              <p className="text-xs text-primary-600 font-medium">Principal Amount</p>
              <p className="text-sm font-bold text-primary-900">{formatPrice(loanAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-primary-600 font-medium">Total Interest</p>
              <p className="text-sm font-bold text-primary-900">{formatPrice(totalInterest)}</p>
            </div>
          </div>
          <div className="border-t border-primary-200 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <p className="text-xs text-primary-600 font-medium">Total Amount Payable</p>
              <p className="text-sm font-bold text-primary-900">{formatPrice(totalPayment)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
