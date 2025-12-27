import React from "react";
import { motion } from "framer-motion";
import {
  FaUpload,
  FaRobot,
  FaUserCheck,
  FaClipboardList,
} from "react-icons/fa";

const howItWorksSteps = [
  {
    title: "Submission",
    description: "Students upload their thesis to the platform securely.",
    icon: FaUpload,
  },
  {
    title: "AI Evaluation",
    description:
      "DeskInspect analyzes the thesis for quality, plagiarism, and AI content.",
    icon: FaRobot,
  },
  {
    title: "Supervisor Review",
    description:
      "Faculty reviews AI-generated scores and provides additional feedback.",
    icon: FaUserCheck,
  },
  {
    title: "Feedback & Reports",
    description:
      "Students receive comprehensive feedback and evaluation reports.",
    icon: FaClipboardList,
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 bg-gray-50 relative">
      <div className="container mx-auto px-6 lg:px-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A simple, automated process from submission to final evaluation
          </p>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Connection Lines for Desktop */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-[#6B46C1]/20 transform -translate-y-1/2"></div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.12,
                  ease: "easeOut",
                }}
                className="relative group"
              >
                <div className="bg-white rounded-2xl border border-gray-200 p-8 h-full transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#6B46C1]/20">
                  {/* Step Number Badge */}
                  <div className="absolute -top-5 -right-5 w-16 h-16 bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg z-10">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6B46C1]/10 to-[#8B5CF6]/5 text-[#6B46C1] text-4xl flex items-center justify-center transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110">
                      <step.icon />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Mobile Connection Line */}
                {index < howItWorksSteps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <div className="w-1 h-8 bg-[#6B46C1]/20"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4 text-lg">
            Ready to experience the future of thesis evaluation?
          </p>
          <a
            href="/login"
            className="inline-block bg-[#6B46C1] text-white font-semibold px-8 py-3 rounded-lg hover:bg-[#553399] transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Get Started Today
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
