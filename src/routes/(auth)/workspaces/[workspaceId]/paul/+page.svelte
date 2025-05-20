<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Chart from "$lib/components/ui/chart/index.js";
  import { Arc, PieChart, Text } from "layerchart";
  import { TrendingUpIcon } from "lucide-svelte";

  const chartData = [
    { browser: "chrome", visitors: 275, color: "var(--color-chart-1)" },
    { browser: "safari", visitors: 200, color: "var(--color-chart-2)" },
    { browser: "firefox", visitors: 187, color: "var(--color-chart-3)" },
    { browser: "edge", visitors: 173, color: "var(--color-chart-4)" },
    { browser: "other", visitors: 90, color: "var(--color-chart-5)" },
  ];
  const chartConfig = {
    visitors: { label: "Visitors" },
    chrome: { label: "Chrome" },
    safari: { label: "Safari" },
    firefox: { label: "Firefox" },
    edge: { label: "Edge" },
    other: { label: "Other" },
  } satisfies Chart.ChartConfig;
</script>

chez paul

<Card.Root class="flex flex-col">
  <Card.Header class="items-center">
    <Card.Title>Pie Chart - Custom Label</Card.Title>
    <Card.Description>January - June 2024</Card.Description>
  </Card.Header>
  <Card.Content class="flex-1">
    <Chart.Container
      config={chartConfig}
      class="mx-auto aspect-square max-h-[250px]"
    >
      <PieChart
        data={chartData}
        key="browser"
        value="visitors"
        cRange={chartData.map((d) => d.color)}
        c="color"
        innerRadius={60}
        props={{
          pie: {
            motion: "tween",
          },
        }}
      >
        {#snippet aboveMarks()}
          <Text
            value={String(120)}
            textAnchor="middle"
            verticalAnchor="middle"
            class="fill-foreground text-3xl! font-bold"
            dy={3}
          />
          <Text
            value="Visitors"
            textAnchor="middle"
            verticalAnchor="middle"
            class="fill-muted-foreground! text-muted-foreground"
            dy={22}
          />
        {/snippet}
        {#snippet tooltip()}
          <Chart.Tooltip hideLabel indicator="line" />
        {/snippet}
        {#snippet arc({ props, visibleData, index })}
          <Arc {...props}>
            {#snippet children({ getArcTextProps })}
              <Text
                value={visibleData[index].visitors}
                {...getArcTextProps("outer", {
                  startOffset: "50%",
                  outerPadding: 10,
                })}
                class="fill-foreground"
              />
            {/snippet}
          </Arc>
        {/snippet}
      </PieChart>
    </Chart.Container>
  </Card.Content>
  <Card.Footer class="flex-col gap-2 text-sm">
    <div class="flex items-center gap-2 font-medium leading-none">
      Trending up by 5.2% this month <TrendingUpIcon class="size-4" />
    </div>
    <div class="text-muted-foreground leading-none">
      Showing total visitors for the last 6 months
    </div>
  </Card.Footer>
</Card.Root>
