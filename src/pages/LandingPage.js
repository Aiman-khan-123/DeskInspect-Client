import { motion } from "framer-motion";
import Header from "../components/Header";
import HowItWorks from "../components/HowItWorks";
import TestimonialsAndCTA from "../components/TestimonialsAndCTA";
import Footer from "../components/Footer";
import {
  FaCheckCircle,
  FaClipboardCheck,
  FaBrain,
  FaComments,
  FaUserTie,
  FaFileAlt,
  FaGraduationCap,
  FaChartLine,
  FaRocket,
  FaShieldAlt,
  FaArrowRight,
  FaCheck,
} from "react-icons/fa";

const features = [
  {
    icon: FaClipboardCheck,
    title: "AI-Driven Evaluation",
    description:
      "Utilize advanced AI algorithms to assess thesis components based on predefined rubrics, providing consistent and objective evaluations.",
  },
  {
    icon: FaCheckCircle,
    title: "Plagiarism Detection",
    description:
      "Compare submitted theses with academic databases to identify duplicate content and generate detailed similarity reports.",
  },
  {
    icon: FaBrain,
    title: "AI Content Analysis",
    description:
      "Detect machine-generated text within thesis submissions and provide detailed reports on AI-generated content.",
  },
  {
    icon: FaComments,
    title: "Automated Feedback",
    description:
      "Generate AI-driven comments and scoring based on predefined rubric criteria for each thesis section.",
  },
  {
    icon: FaUserTie,
    title: "Supervisor Review",
    description:
      "Enable faculty members to review AI-generated evaluations and provide additional feedback for fair assessment.",
  },
  {
    icon: FaFileAlt,
    title: "Comprehensive Reports",
    description:
      "Generate detailed evaluation reports with scores, feedback, and plagiarism findings in a structured format.",
  },
];

const stats = [
  { icon: FaGraduationCap, number: "10,000+", label: "Theses Evaluated" },
  { icon: FaChartLine, number: "95%", label: "Accuracy Rate" },
  { icon: FaRocket, number: "70%", label: "Time Saved" },
  { icon: FaShieldAlt, number: "100%", label: "Secure & Private" },
];

const benefits = [
  "Automated AI-driven thesis evaluation",
  "Advanced plagiarism detection and reporting",
  "AI-generated content analysis",
  "Comprehensive feedback and scoring",
  "Streamlined faculty review process",
];

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen w-full bg-white">
      <Header />

      {/* Hero Section - Microsoft Teams Style */}
      <section className="pt-16 pb-16 md:pt-20 md:pb-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-4">
                <span className="bg-[#6B46C1]/10 text-[#6B46C1] px-4 py-2 rounded-full text-sm font-semibold">
                  Academic Excellence Platform
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Streamline MS Thesis
                <span className="block text-[#6B46C1]">Evaluation with AI</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
                DeskInspect offers a comprehensive web-based solution for
                academic institutions to automate thesis assessment, detect
                plagiarism, and provide consistent feedback.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center bg-[#6B46C1] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#553399] transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Get Started
                  <FaArrowRight className="ml-2" />
                </a>
                <a
                  href="#how-it-works"
                  className="inline-flex items-center justify-center bg-white text-[#6B46C1] border-2 border-[#6B46C1] px-8 py-4 rounded-lg font-semibold hover:bg-[#6B46C1]/5 transition-all duration-300"
                >
                  Learn More
                </a>
              </div>

              <div className="space-y-3">
                {benefits.slice(0, 3).map((benefit, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                    className="flex items-center text-gray-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#6B46C1]/10 flex items-center justify-center mr-3">
                      <FaCheck className="text-[#6B46C1] text-xs" />
                    </div>
                    <span>{benefit}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Illustration - Modern AI Dashboard Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:mt-8"
            >
              {/* Radial gradient background glow */}
              <div className="absolute inset-0 bg-gradient-radial from-[#6B46C1]/20 via-transparent to-transparent blur-3xl scale-110"></div>

              {/* Main dashboard container */}
              <div className="relative bg-white/95 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-gray-100">
                {/* Soft purple glow around container */}
                <div className="absolute -inset-1 bg-gradient-to-br from-[#6B46C1]/30 via-[#8B5CF6]/20 to-[#6B46C1]/30 rounded-3xl blur-xl opacity-60"></div>

                <div className="relative z-10 space-y-5">
                  {/* Card 1: Thesis Submission */}
                  <motion.div
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 shadow-lg border border-gray-100"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon container with glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#6B46C1]/30 rounded-xl blur-md"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg">
                          <FaFileAlt className="text-white text-2xl" />
                        </div>
                      </div>

                      {/* Abstract content lines */}
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-4/5"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-3/5"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="h-2 bg-[#6B46C1]/20 rounded-full w-16"></div>
                          <div className="h-2 bg-[#6B46C1]/20 rounded-full w-20"></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 2: AI Analysis */}
                  <motion.div
                    className="bg-gradient-to-br from-[#6B46C1]/5 to-white rounded-2xl p-5 shadow-lg border border-[#6B46C1]/20 ml-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon container with enhanced glow */}
                      <div className="relative">
                        <motion.div
                          className="absolute inset-0 bg-[#8B5CF6]/40 rounded-xl blur-lg"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        ></motion.div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#8B5CF6] to-[#6B46C1] rounded-xl flex items-center justify-center shadow-xl">
                          <FaBrain className="text-white text-2xl" />
                        </div>
                      </div>

                      {/* Abstract content with progress indicators */}
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gradient-to-r from-[#6B46C1]/40 to-[#6B46C1]/20 rounded-full w-full"></div>
                        <div className="h-2 bg-[#6B46C1]/20 rounded-full w-4/5"></div>
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-[#6B46C1] to-[#8B5CF6]"
                              initial={{ width: "0%" }}
                              animate={{ width: "75%" }}
                              transition={{ duration: 1.5, delay: 0.8 }}
                            ></motion.div>
                          </div>
                          <span className="text-xs font-semibold text-[#6B46C1]">
                            75%
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 3: Evaluation Results */}
                  <motion.div
                    className="bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-5 shadow-lg border border-gray-100 mr-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon with success glow */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-green-400/30 rounded-xl blur-md"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                          <FaCheckCircle className="text-white text-2xl" />
                        </div>
                      </div>

                      {/* Result indicators */}
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-11/12"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-2/3"></div>
                        <div className="flex gap-2 mt-3">
                          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Approved
                          </div>
                          <div className="px-3 py-1 bg-[#6B46C1]/10 text-[#6B46C1] rounded-full text-xs font-semibold">
                            95%
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Card 4: Supervisor Review */}
                  <motion.div
                    className="bg-gradient-to-br from-white to-purple-50/30 rounded-2xl p-5 shadow-lg border border-[#6B46C1]/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Icon */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-[#6B46C1]/20 rounded-xl blur-md"></div>
                        <div className="relative w-14 h-14 bg-gradient-to-br from-[#6B46C1] to-[#553399] rounded-xl flex items-center justify-center shadow-lg">
                          <FaUserTie className="text-white text-2xl" />
                        </div>
                      </div>

                      {/* Abstract content */}
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gradient-to-r from-gray-300 to-gray-200 rounded-full w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Floating decorative elements */}
                <motion.div
                  className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-br from-[#6B46C1]/20 to-[#8B5CF6]/20 rounded-full blur-2xl"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                ></motion.div>
                <motion.div
                  className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-tr from-[#8B5CF6]/15 to-[#6B46C1]/15 rounded-full blur-3xl"
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                ></motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-grow bg-white">
        {/* Key Features Section */}
        <section className="py-20 px-6 lg:px-12">
          <div className="container mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Powerful Features
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to streamline MS thesis evaluation with
                cutting-edge AI technology
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="group bg-white rounded-2xl border border-gray-200 p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#6B46C1]/20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: idx * 0.1,
                    ease: "easeOut",
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-[#6B46C1] to-[#8B5CF6] rounded-2xl flex items-center justify-center mb-6 shadow-md transition-all duration-300 group-hover:-translate-y-1 group-hover:rotate-6 group-hover:scale-110">
                    <feature.icon className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <HowItWorks />
        <TestimonialsAndCTA />
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
