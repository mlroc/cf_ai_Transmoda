"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Github, 
  Linkedin, 
  ArrowRight,
  FileText,
  Zap,
  Users,
  Shield,
  Clock,
  Globe
} from "lucide-react";
import { Button } from "@/components/ui/button";

const footerLinks = {
  product: [
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "Contact", href: "#contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Security", href: "/security" },
  ],
};

const socialLinks = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/liumichael04/", icon: Linkedin },
  { name: "GitHub", href: "https://github.com/mlroc", icon: Github },
  { name: "Personal Website", href: "https://mlroc.github.io/", icon: Globe },
];

const features = [
  { icon: FileText, text: "AI-Powered Analysis" },
  { icon: Zap, text: "Lightning Fast" },
  { icon: Users, text: "Team Collaboration" },
  { icon: Shield, text: "Enterprise Security" },
];

export default function Footer() {
  return (
    <footer className="bg-muted/30 border-t border-border">
      {/* Newsletter Section */}
      <div className="border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Stay updated with Transmoda
              </h3>
              <p className="text-muted-foreground mb-6">
                Have questions or want to collaborate? Get in touch with us.
              </p>
              <div className="flex justify-center">
                <Button 
                  asChild
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <a href="mailto:mliudev@proton.me">
                    Contact Us
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
          {/* Brand Section - Left Side */}
          <div className="flex-1 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <Link href="/" className="flex items-center space-x-2 group mb-4">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    Transmoda
                  </span>
                  <span className="text-xs text-muted-foreground -mt-1">
                    AI Content Creator
                  </span>
                </div>
              </Link>
              
              <p className="text-muted-foreground mb-6">
                Transform your PDFs into engaging content with AI-powered analysis. 
                Create viral social media content from any document.
              </p>

              {/* Feature Pills */}
              <div className="flex flex-wrap gap-2 mb-6">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon;
                  return (
                    <motion.div
                      key={feature.text}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center space-x-1 px-3 py-1 bg-muted rounded-full text-xs text-muted-foreground"
                    >
                      <IconComponent className="h-3 w-3" />
                      <span>{feature.text}</span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon;
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      className="p-2 rounded-lg bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <IconComponent className="h-4 w-4" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Links Sections - Right Side */}
          <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
            {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                viewport={{ once: true }}
                className="min-w-[120px]"
              >
                <h4 className="font-semibold text-foreground mb-4 capitalize">
                  {category}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground hover:text-primary transition-colors text-sm"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-border/50"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <span>© 2025 Transmoda. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <Globe className="h-3 w-3" />
                <span>English</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Status: All systems operational</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
