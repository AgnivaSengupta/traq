const Footer = () => {
  return (
    <footer className="border-t border-border py-8">
      <div className="container flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>
          Made by{" "}
          <span className="font-medium text-foreground">Agniva Sengupta</span>
        </p>
        <p>© {new Date().getFullYear()} traq. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
