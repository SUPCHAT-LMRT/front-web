import { unproxify } from "$lib/utils/proxy";
import ApexCharts, { type ApexOptions } from "apexcharts";
import type { Action } from "svelte/action";

export const chart: Action<HTMLElement, never> = (
  node: HTMLElement,
  options: ApexOptions,
) => {
  const myChart = new ApexCharts(node, unproxify(options));
  myChart.render();

  return {
    update(options: ApexOptions) {
      myChart.updateOptions(unproxify(options));
    },
    destroy() {
      myChart.destroy();
    },
  };
};
