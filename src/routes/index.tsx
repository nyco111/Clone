import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

function HomePage() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const frame = frameRef.current;
    const page = frame?.contentDocument;
    if (!loaded || !frame || !page) return;

    let frameId = 0;
    const resizeFrame = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const height = Math.max(
          page.documentElement.scrollHeight,
          page.body?.scrollHeight ?? 0,
        );
        if (height > 0 && frame.style.height !== `${height}px`) {
          frame.style.height = `${height}px`;
        }
      });
    };

    const handlePageClick = (event: MouseEvent) => {
      const clickedElement = event.target as Element | null;
      const anchor = clickedElement?.closest<HTMLAnchorElement>('a[href^="#"]');
      const id = anchor?.getAttribute("href")?.slice(1);
      const target = id ? page.getElementById(decodeURIComponent(id)) : null;
      if (!anchor || !target) return;

      event.preventDefault();
      const top = frame.getBoundingClientRect().top + window.scrollY +
        target.getBoundingClientRect().top;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      frame.contentWindow?.history.replaceState(null, "", `#${encodeURIComponent(id)}`);
    };

    page.addEventListener("click", handlePageClick);
    window.addEventListener("resize", resizeFrame);
    const observer = new ResizeObserver(resizeFrame);
    observer.observe(page.documentElement);
    if (page.body) observer.observe(page.body);
    page.querySelectorAll("img").forEach((image) => {
      if (!image.complete) image.addEventListener("load", resizeFrame, { once: true });
    });
    resizeFrame();

    return () => {
      cancelAnimationFrame(frameId);
      page.removeEventListener("click", handlePageClick);
      window.removeEventListener("resize", resizeFrame);
      observer.disconnect();
    };
  }, [loaded]);

  return (
    <iframe
      ref={frameRef}
      src="/drinks-visuais-clone.html"
      title="Bartender de Respeto — Manual de Supervivencia Detrás de la Barra"
      onLoad={() => setLoaded(true)}
      style={{ display: "block", width: "100%", minHeight: "100vh", height: "100vh", border: 0 }}
    />
  );
}

export const Route = createFileRoute("/")({ component: HomePage });
