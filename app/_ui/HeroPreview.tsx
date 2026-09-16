import { Icon } from "@/app/_ui/marks";

// The product, shown rather than described.
//
// Not a screenshot and not an illustration: this is the real design system —
// the same card, tbl, badge and num classes the founder dashboard uses —
// rendered against fixed sample figures. A screenshot goes stale the moment the
// UI changes and nobody notices for months. This cannot, because it is built
// from the same CSS; if the dashboard's table changes, this changes with it.
//
// The numbers are illustrative and the panel says so, because a landing page
// implying someone has already earned £240 would be a lie told in a place
// people are deciding whether to trust you.
export function HeroPreview() {
  return (
    <div aria-hidden="false">
      <div className="card">
        <div className="card-h">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name="wallet" size={14} />
            <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>Your wallet</span>
          </span>
          <span className="badge b-pine">Live</span>
        </div>
        <div className="card-b">
          <div style={{ marginBottom: 12 }}>
            <span className="num" style={{ fontSize: "var(--fs-7)", fontWeight: "var(--fw-bold)", letterSpacing: "-0.022em" }}>
              $240.00
            </span>
            <span className="tiny" style={{ display: "block", marginTop: 4 }}>
              available to pay out
            </span>
          </div>

          <div className="tblwrap">
            <table className="tbl">
              <tbody>
                <tr>
                  <th scope="row">Earned</th>
                  <td className="num" style={{ textAlign: "right" }}>$300.00</td>
                </tr>
                <tr>
                  <th scope="row">Still settling</th>
                  <td className="num" style={{ textAlign: "right" }}>$15.00</td>
                </tr>
                <tr>
                  <th scope="row">Already paid out</th>
                  <td className="num" style={{ textAlign: "right" }}>$60.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="card-h">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Icon name="card" size={14} />
            <span style={{ fontSize: "var(--fs-3)", fontWeight: 560 }}>What you sell</span>
          </span>
        </div>
        <div className="card-b" style={{ paddingTop: 0, paddingBottom: 0 }}>
          <div className="tblwrap">
            <table className="tbl">
              <tbody>
                <tr>
                  <td>Sticker pack</td>
                  <td className="num" style={{ textAlign: "right" }}>$5.00</td>
                  <td style={{ width: 1 }}><span className="badge b-pine">Live</span></td>
                </tr>
                <tr>
                  <td>Commission slot</td>
                  <td className="num" style={{ textAlign: "right" }}>$45.00</td>
                  <td style={{ width: 1 }}><span className="badge b-pine">Live</span></td>
                </tr>
                <tr style={{ color: "var(--ink-3)" }}>
                  <td>Print run</td>
                  <td className="num" style={{ textAlign: "right" }}>$18.00</td>
                  <td style={{ width: 1 }}><span className="badge b-amber">Draft</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card-f">
          <span className="tiny">
            Illustrative figures. Your own wallet starts at zero and is folded from your real
            payments, never stored as a number.
          </span>
        </div>
      </div>
    </div>
  );
}
