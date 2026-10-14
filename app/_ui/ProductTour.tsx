"use client";

import { useId, useRef, useState, type ReactNode, type KeyboardEvent } from "react";

const VIEWS = [
  { label: "Customer checkout", description: "A clear price and a dedicated payment page. Share the link directly or add it to your app." },
  { label: "Payment record", description: "Collected, fees, settling and available amounts stay distinct. Choose a figure to understand it." },
];

/** An interactive marketing example. Both views stay mounted so their examples never replay. */
export function ProductTour({ checkout, record }: { checkout: ReactNode; record: ReactNode }) {
  const id = useId();
  const [selected, setSelected] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    if (event.key === "ArrowRight") next = (index + 1) % VIEWS.length;
    else if (event.key === "ArrowLeft") next = (index + VIEWS.length - 1) % VIEWS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = VIEWS.length - 1;
    else return;
    event.preventDefault();
    setSelected(next);
    tabs.current[next]?.focus();
  }

  return (
    <div className="product-tour">
      <div className="tour-tabs" role="tablist" aria-label="Explore the product example">
        {VIEWS.map((view, index) => (
          <button
            key={view.label}
            ref={el => { tabs.current[index] = el; }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-controls={`${id}-panel-${index}`}
            aria-selected={selected === index}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
            onKeyDown={event => navigate(event, index)}
          >{view.label}</button>
        ))}
      </div>
      {[checkout, record].map((content, index) => (
        <div
          key={index}
          className="tour-panel"
          role="tabpanel"
          id={`${id}-panel-${index}`}
          aria-labelledby={`${id}-tab-${index}`}
          hidden={selected !== index}
          tabIndex={0}
        >
          <p className="tour-description">{VIEWS[index].description}</p>
          {content}
        </div>
      ))}
      <p className="tour-example-note">Illustrative examples. These are not live payments or an account balance.</p>
    </div>
  );
}
