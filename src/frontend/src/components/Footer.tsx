export function Footer() {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "lichtkunst",
  );

  return (
    <footer className="border-t border-border/40 mt-20 py-8">
      <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
        <p className="heading-serif text-sm text-foreground/60">
          Istvan Seidel · Lichtkunst
        </p>
        <p>
          © {year}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent transition-colors"
          >
            Built with caffeine.ai
          </a>
        </p>
      </div>
    </footer>
  );
}
