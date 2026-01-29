import { Phone, Mail, MapPin, Clock, Facebook, Instagram, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const Homepage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-lg">KN</span>
            </div>
            <span className="font-display text-xl font-semibold text-foreground">Krishna Nagesh</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
            <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
          </div>
          <Link to="/admin/login">
            <Button variant="outline" size="sm">Admin Login</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-primary">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-primary to-primary" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        </div>
        
        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent font-medium text-sm mb-6">
              Premium Wear & Collections
            </span>
          </div>
          <h1 className="animate-fade-up font-display text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6" style={{ animationDelay: "0.2s" }}>
            Krishna Nagesh
            <br />
            <span className="text-accent">Collection</span>
          </h1>
          <p className="animate-fade-up text-primary-foreground/80 text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ animationDelay: "0.3s" }}>
            Discover exquisite fashion and premium clothing that reflects elegance, 
            quality, and timeless style for every occasion.
          </p>
          <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center" style={{ animationDelay: "0.4s" }}>
            <Button variant="gold" size="xl">
              Explore Collection
            </Button>
            <Button variant="outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Contact Us
            </Button>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 rounded-full bg-accent/10 animate-float" />
        <div className="absolute bottom-1/3 right-10 w-32 h-32 rounded-full bg-accent/5 animate-float" style={{ animationDelay: "2s" }} />
      </section>

      {/* Owner Details Section */}
      <section id="about" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-up">
              <span className="text-accent font-medium text-sm uppercase tracking-wider">About the Owner</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                A Legacy of Excellence in Fashion
              </h2>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                With over two decades of experience in the fashion industry, Krishna Nagesh Collection 
                has established itself as a premier destination for quality apparel. Our commitment 
                to excellence and customer satisfaction has made us a trusted name in the community.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">+91 98765 43210</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">info@krishnanagesh.com</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 p-8">
                <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto rounded-full bg-primary flex items-center justify-center mb-6">
                      <span className="text-primary-foreground font-display font-bold text-5xl">KN</span>
                    </div>
                    <h3 className="font-display text-2xl font-bold text-foreground">Krishna Nagesh</h3>
                    <p className="text-muted-foreground mt-2">Founder & Owner</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-accent font-medium text-sm uppercase tracking-wider">What We Offer</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2">
              Our Services
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Men's Wear", description: "Premium suits, shirts, and traditional wear for the modern gentleman." },
              { title: "Women's Collection", description: "Elegant sarees, kurtas, and contemporary fashion for every occasion." },
              { title: "Kids Fashion", description: "Stylish and comfortable clothing for your little ones." },
              { title: "Custom Tailoring", description: "Personalized fitting and alterations for the perfect look." },
            ].map((service, index) => (
              <Card 
                key={service.title} 
                variant="elevated"
                className="group cursor-pointer hover-lift animate-fade-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <div className="w-6 h-6 rounded-full bg-accent" />
                  </div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{service.title}</h3>
                  <p className="text-muted-foreground text-sm">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <span className="text-accent font-medium text-sm uppercase tracking-wider">Get in Touch</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mt-2 mb-8">
                Visit Our Store
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Address</h4>
                    <p className="text-muted-foreground">123 Fashion Street, Main Market<br />City Center, State - 400001</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">Business Hours</h4>
                    <p className="text-muted-foreground">Monday - Saturday: 10:00 AM - 9:00 PM<br />Sunday: 11:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-card bg-muted h-80 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Map Location</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                  <span className="text-accent-foreground font-display font-bold text-lg">KN</span>
                </div>
                <span className="font-display text-xl font-semibold">Krishna Nagesh</span>
              </div>
              <p className="text-primary-foreground/70 text-sm">
                Premium fashion destination offering quality apparel for the entire family.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm text-primary-foreground/70">
                <a href="#about" className="block hover:text-primary-foreground transition-colors">About Us</a>
                <a href="#services" className="block hover:text-primary-foreground transition-colors">Services</a>
                <a href="#contact" className="block hover:text-primary-foreground transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect With Us</h4>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
            <p>© 2024 Krishna Nagesh Collection. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Homepage;
