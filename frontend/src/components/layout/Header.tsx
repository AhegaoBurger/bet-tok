import { Link } from "@tanstack/react-router";
import { Menu, X, User, Wallet } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import { APP_NAME } from "@/shared/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const { isConnected, address, connect } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/events", label: "Events" },
    { to: "/markets", label: "Markets" },
    { to: "/api-explorer", label: "API Explorer" },
    { to: "/about", label: "About" },
  ] as const;

  const shortenAddress = (addr: string | null) => {
    if (!addr) return "";
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold">{APP_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        {!isMobile && (
          <nav className="flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                {link.label}
              </Link>
            ))}

            {/* Auth Button */}
            {isConnected ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground"
              >
                <User className="h-4 w-4" />
                {shortenAddress(address)}
              </Link>
            ) : (
              <Button size="sm" onClick={connect}>
                <Wallet className="h-4 w-4 mr-2" />
                Connect
              </Button>
            )}
          </nav>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="border-t bg-background">
          <nav className="container mx-auto flex flex-col space-y-4 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {/* Mobile Auth */}
            {isConnected ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="h-4 w-4" />
                Profile ({shortenAddress(address)})
              </Link>
            ) : (
              <Button size="sm" onClick={connect} className="w-full">
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
