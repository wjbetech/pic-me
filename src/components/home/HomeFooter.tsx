export default function HomeFooter() {
  return (
    <footer className="border-t-4 border-base-content py-10 px-6 text-center">
      <p className="font-display text-lg mb-1">PicMe</p>
      <p className="font-body text-sm opacity-70">
        Free animal-name games for young explorers · © {new Date().getFullYear()}{" "}
        <a
          href="https://github.com/wjbetech/pic-me"
          className="underline hover:opacity-100"
          target="_blank"
          rel="noreferrer"
        >
          wjbetech/pic-me
        </a>
      </p>
      <p className="font-body text-xs opacity-50 mt-2">
        Hero &amp; marquee photos: Wikimedia Commons contributors — freely
        licensed, watermark-free.
      </p>
    </footer>
  );
}
