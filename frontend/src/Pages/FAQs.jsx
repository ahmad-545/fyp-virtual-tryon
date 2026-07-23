import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, MessageSquare, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';

function FAQs() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const faqData = [
    {
      category: "Virtual Try-On",
      icon: <HelpCircle className="text-[#C19A6B]" size={18} />,
      questions: [
        {
          q: "How does the TryLo Virtual Try-On feature work?",
          a: "It is very simple. On any product page, click 'Try On', upload a clear photo of yourself, and our AI will instantly show you how the outfit looks on you."
        },
        {
          q: "What kind of photo should I upload?",
          a: "For the best result, use a clear, front-facing photo taken in good lighting with a simple background."
        }
      ]
    },
    {
      category: "Orders & Sizing",
      icon: <ShoppingBag className="text-neutral-900" size={18} />,
      questions: [
        {
          q: "What quality of fabric do you use?",
          a: "We use premium cotton and durable fabrics that offer great comfort, easy care, and long-lasting colors."
        },
        {
          q: "How do I pick the right size?",
          a: "You can check the size chart available on every product page, or use our Virtual Try-On tool to check the fit."
        }
      ]
    },
    {
      category: "Shipping & Delivery",
      icon: <Truck className="text-neutral-900" size={18} />,
      questions: [
        {
          q: "How long does delivery take?",
          a: "Orders usually take 3 to 5 business days to arrive anywhere across Pakistan. You will receive tracking details via SMS or email."
        },
        {
          q: "Do you offer free delivery?",
          a: "Yes, standard delivery is completely free on all orders above PKR 3,000."
        }
      ]
    },
    {
      category: "Returns & Exchanges",
      icon: <ShieldCheck className="text-neutral-900" size={18} />,
      questions: [
        {
          q: "What is your return and exchange policy?",
          a: "We offer an easy 7-day exchange policy. Items must be unused and have their original tags attached."
        },
        {
          q: "Can I check my parcel before paying (COD)?",
          a: "Courier rules do not allow opening packages before payment, but your purchase is fully protected by our simple 7-day exchange policy."
        }
      ]
    }
  ];

  let globalIndex = 0;

  return (
    <div className="bg-[#fcfcfc] min-h-screen text-neutral-900 w-full font-sans antialiased">
      
      {/* 1. HERO HEADER */}
      <div className="bg-white border-b border-neutral-200/60 py-16 sm:py-24 px-6 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-neutral-950 uppercase">
          Help Center
        </h1>
        <p className="mt-4 text-sm sm:text-base text-neutral-500 max-w-lg mx-auto font-light leading-relaxed">
          Find simple answers to common questions about our AI Try-On, shipping, sizes, and orders.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        
        {/* 2. DYNAMIC ACCORDION */}
        <div className="space-y-12">
          {faqData.map((section, sIdx) => (
            <div key={sIdx} className="space-y-6">
              <div className="flex items-center gap-3 pb-3 border-b border-neutral-200">
                {section.icon}
                <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-neutral-900">
                  {section.category}
                </h2>
              </div>

              <div className="space-y-3">
                {section.questions.map((item, qIdx) => {
                  const currentKey = globalIndex++;
                  const isOpen = activeIndex === currentKey;

                  return (
                    <div key={qIdx} className={`border rounded-2xl bg-white transition-all duration-300 shadow-sm overflow-hidden ${isOpen ? 'border-[#C19A6B]' : 'border-neutral-200/80 hover:border-neutral-300'}`}>
                      <button
                        onClick={() => toggleAccordion(currentKey)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none cursor-pointer"
                      >
                        <span className={`text-xs sm:text-sm font-semibold transition ${isOpen ? 'text-[#C19A6B]' : 'text-neutral-900'}`}>
                          {item.q}
                        </span>
                        {isOpen ? <ChevronUp size={16} className="text-[#C19A6B] shrink-0 ml-2" /> : <ChevronDown size={16} className="text-neutral-400 shrink-0 ml-2" />}
                      </button>

                      <div className={`grid transition-all duration-300 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                        <div className="overflow-hidden">
                          <p className="px-6 pb-5 text-xs sm:text-sm text-neutral-500 font-light leading-relaxed border-t border-neutral-100 pt-3">
                            {item.a}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* 3. SUPPORT FOLLOWER */}
        <div className="mt-20 bg-neutral-900 text-white p-8 sm:p-10 rounded-2xl text-center space-y-4 shadow-xl border border-neutral-800">
          <MessageSquare className="mx-auto text-[#C19A6B]" size={24} />
          <h3 className="text-sm font-bold uppercase tracking-widest">Still have a question?</h3>
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-sm mx-auto leading-relaxed">
            Our support team is always available to help you with sizes, orders, and styling queries.
          </p>
          <div className="pt-4">
            <span className="inline-block text-[10px] sm:text-xs font-mono font-bold text-[#C19A6B] bg-neutral-950 border border-neutral-800 px-6 py-3.5 rounded-xl tracking-wider">
              SUPPORT@TRYLO.COM
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FAQs;