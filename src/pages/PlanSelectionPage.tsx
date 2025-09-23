import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Check, ArrowLeft, Crown, Star } from 'lucide-react';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    description: 'Perfect for early-stage founders',
    features: [
      'Access to founder network',
      'Monthly networking events',
      'Basic perks & discounts',
      'Community forum access',
      'Mobile app'
    ],
    popular: false
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 99,
    description: 'Best for growing startups',
    features: [
      'Everything in Basic',
      'Exclusive investor events',
      'Premium perks worth $10k+',
      'Direct messaging',
      'Priority customer support',
      'Startup showcases',
      'Mentorship program'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    description: 'For established companies',
    features: [
      'Everything in Premium',
      'Custom networking events',
      'Dedicated account manager',
      'API access',
      'Advanced analytics',
      'White-label solutions',
      'Custom integrations'
    ],
    popular: false
  }
];

export const PlanSelectionPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState('premium');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSelectPlan = async (planId: string) => {
    setLoading(true);
    
    // Mock Stripe payment process
    setTimeout(() => {
      setLoading(false);
      navigate('/pending');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <Link to="/register" className="inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Registration
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your startup journey. All plans include access to our exclusive founder network.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-xl p-8 ${
                plan.popular ? 'ring-2 ring-purple-600 transform scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Crown className="h-4 w-4 mr-1" />
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={loading}
                className={`w-full py-4 px-6 rounded-lg font-semibold transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : `Select ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Why BXtra Club?</h3>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Verified Network</h4>
                <p className="text-sm text-gray-600">All members are verified startup founders</p>
              </div>
              <div>
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🤝</span>
                </div>
                <h4 className="font-semibold text-gray-900">Quality Connections</h4>
                <p className="text-sm text-gray-600">Connect with relevant founders in your industry</p>
              </div>
              <div>
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">🚀</span>
                </div>
                <h4 className="font-semibold text-gray-900">Growth Resources</h4>
                <p className="text-sm text-gray-600">Access tools and perks to scale your startup</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};