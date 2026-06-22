export default {
  title: "CMB/Components"
};

export const Buttons = () => `
  <main style="padding:24px;background:#eef5f2;min-height:100vh">
    <button class="primary-btn">Save</button>
    <button class="secondary-btn">Review</button>
    <button class="ghost-btn">Cancel</button>
    <button class="primary-btn" disabled>Loading</button>
  </main>
`;

export const InventoryCard = () => `
  <main style="padding:24px;background:#eef5f2;min-height:100vh">
    <div class="count-card">
      <div class="count-card-head">
        <div>
          <span class="code-pill">00027</span>
          <h4>Greenmedi / 20L</h4>
          <p>2F warehouse - finished goods</p>
        </div>
        <span class="badge is-green">Matched</span>
      </div>
      <div class="count-metrics">
        <label><span>System</span><input value="906"></label>
        <label><span>Count</span><input value="900"></label>
      </div>
    </div>
  </main>
`;

export const StatusMatrix = () => `
  <main style="padding:24px;background:#eef5f2;min-height:100vh">
    <span class="badge is-green">PASS</span>
    <span class="badge is-blue">READY_LOCAL</span>
    <span class="badge is-amber">PILOT_READY</span>
  </main>
`;
