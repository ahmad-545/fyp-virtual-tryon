import React from "react";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Contact() {
  
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    
    // Web3Forms API requirement
    formData.append("access_key", "fff54e3c-49ac-48a4-956b-b7e75fe397f0");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      }).then((res) => res.json());

      if (res.success) {
        toast.success("Message sent successfully!");
        event.target.reset();
      } else {
        toast.error("Something went wrong!");
      }
    } catch (error) {
      toast.error("Network error!");
    }
  };

  return (
    <section className="w-full bg-white py-16 md:py-24 border-t border-neutral-100">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <div className="max-w-6xl mx-auto px-6 lg:px-10">
        
        {/* Header Section */}
        <div className="mb-12 md:mb-20 text-center">
          <h2 className="text-2xl md:text-4xl font-serif text-neutral-950 uppercase tracking-widest">Contact Support</h2>
          <div className="w-16 h-[2px] bg-[#C19A6B] mt-4 md:mt-6 mx-auto"></div>
          <p className="text-neutral-500 text-sm mt-4 max-w-md mx-auto">
            Have questions about your order or our virtual try-on features? Reach out to us anytime.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-8 lg:space-y-12">
            <div className="space-y-6 md:space-y-8">
              {[ 
                { icon: MapPin, label: "Visit Us", text: "Trylo Store, Lahore, Pakistan" },
                { icon: Mail, label: "Email Support", text: "support@trylo.com" },
                { icon: Phone, label: "Call / WhatsApp", text: "+92 3484236919" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4 md:gap-6 group">
                  <div className="p-3 md:p-4 bg-neutral-50 border border-neutral-100 text-[#C19A6B] group-hover:bg-[#C19A6B] group-hover:text-white transition-all duration-300">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{item.label}</p>
                    <p className="font-serif text-base md:text-lg text-neutral-900 mt-1">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Column */}
          <form className="lg:col-span-7 bg-neutral-50 p-6 sm:p-10 md:p-12 border border-neutral-100 shadow-sm" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-8">
              <input 
                type="text" 
                name="name" 
                placeholder="Your Name" 
                required 
                className="w-full bg-white border border-neutral-200 py-4 px-5 text-sm placeholder-neutral-400 focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] outline-none transition-all" 
              />
              <input 
                type="email" 
                name="email" 
                placeholder="Email Address" 
                required 
                className="w-full bg-white border border-neutral-200 py-4 px-5 text-sm placeholder-neutral-400 focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] outline-none transition-all" 
              />
            </div>
            
            <textarea 
              name="message" 
              placeholder="How can we help you?" 
              rows="5" 
              required 
              className="w-full bg-white border border-neutral-200 py-4 px-5 text-sm placeholder-neutral-400 focus:border-[#C19A6B] focus:ring-1 focus:ring-[#C19A6B] outline-none transition-all mb-6 md:mb-8 resize-none"
            ></textarea>
            
            <button 
              type="submit" 
              className="flex items-center gap-3 bg-neutral-900 text-white px-8 md:px-12 py-4 md:py-5 text-xs uppercase tracking-[0.2em] font-bold hover:bg-[#C19A6B] transition-all w-full justify-center shadow-md active:scale-[0.99]"
            >
              Send Message <ArrowRight size={14} />
            </button>
          </form>

        </div>
      </div>
    </section>
  );
}

export default Contact;