import React, { useRef, useEffect } from "react";
import * as D3 from "d3";
import "d3-selection-multi";
import moment from "moment";

const height = 400;
const xMargin = 60;
const yMargin = 20;
const barPadding = 5;
const colorScale = D3.scaleLinear().domain([0, 2]).range(["white", "red"]);

export default function MonitorChart({ data }) {
  const chartRef = useRef(null);
  const y = useRef(
    D3.scaleLinear()
      .domain([0, 1])
      .range([height - yMargin, yMargin])
  );
  const width = useRef(0);

  // Init chart
  useEffect(() => {
    const chart = D3.select(chartRef.current);

    chart.append("g").attrs({
      id: "leftAxis",
      transform: `translate(${xMargin},0)`,
    });

    chart.append("g").attrs({
      id: "rightAxis",
    });

    chart.append("g").attrs({
      id: "yGrid",
      "clip-path": "url(#contentClip)",
    });

    chart
      .append("line")
      .attrs({
        id: "heavyLoadLine",
        stroke: "red",
        x1: xMargin,
        "stroke-width": 2,
        y1: yMargin,
        y2: yMargin,
      })
      .styles({
        "stroke-dasharray": "4, 3",
      });

    chart
      .append("text")
      .attrs({
        fill: "white",
        transform: `translate(${18},${height / 2}) rotate(-90)`,
      })
      .styles({
        "text-anchor": "middle",
      })
      .text("Average CPU Usage");

    chart
      .append("clipPath")
      .attrs({
        id: "contentClip",
      })
      .append("rect")
      .attrs({
        x: xMargin + 1,
        y: 0,
        height: "100%",
      });

    chart
      .append("clipPath")
      .attrs({
        id: "xTickClip",
      })
      .append("rect")
      .attrs({
        x: xMargin + 1,
        y: 0,
        width: "100%",
        height: "100%",
      });

    chart.append("g").attrs({
      id: "chartContent",
      "clip-path": "url(#contentClip)",
    });
    chart.append("g").attrs({
      id: "xTicks",
      "clip-path": "url(#xTickClip)",
    });

    window.addEventListener("resize", () => redraw(0));
  }, []);

  // Update data to chart
  useEffect(() => {
    const chart = D3.select(chartRef.current);
    const chartContent = D3.select("#chartContent");

    // Update y axes
    const largestY = data.reduce((a, b) => (a.value > b.value ? a : b), {
      value: 1,
    }).value;

    y.current = D3.scaleLinear()
      .domain([0, Math.max(1, largestY)])
      .range([height - yMargin, yMargin]);

    chart
      .select("#leftAxis")
      .transition()
      .duration(400)
      .call(
        D3.axisLeft(y.current)
          .ticks(10)
          .tickSize(0)
          .tickFormat(D3.format(".0%"))
      );
    chart
      .select("#rightAxis")
      .transition()
      .duration(400)
      .call(
        D3.axisRight(y.current)
          .ticks(10)
          .tickSize(0)
          .tickFormat(D3.format(".0%"))
      );

    // Join data
    chartContent
      .selectAll(".heavyLoadMarker")
      .data(data, (d) => d.time)
      .join(
        (enter) =>
          enter.append("rect").attrs({
            class: "heavyLoadMarker",
            x: width.current,
            height: 0,
            y: (d) => 0,
            fill: (d) => "rgba(170,0,0,.4)",
          }),
        (update) => update,
        (exit) => exit.remove()
      );

    chartContent
      .selectAll(".bar")
      .data(data, (d) => d.time)
      .join(
        (enter) =>
          enter.append("rect").attrs({
            class: "bar",
            x: width.current,
            y: (d) => y.current(d.value),
            height: (d) => height - yMargin - y.current(d.value),
            fill: (d) => colorScale(d.value),
          }),
        (update) => update,
        (exit) => exit.remove()
      );

    D3.select("#xTicks")
      .selectAll(".xTick")
      .data(data, (d) => d.time)
      .join(
        (enter) =>
          enter
            .append("text")
            .attrs({
              class: "xTick",
              fill: "white",
              transform: (d, i) =>
                `translate(${width.current},${
                  height - yMargin + 10
                }) rotate(50)`,
            })
            .styles({
              "text-anchor": "start",
              "font-size": "10px",
              opacity: 0,
            })
            .text((d) => `${moment(d.time).format("h:mm:ss a")}`),
        (update) => update,
        (exit) => exit.remove()
      );
    redraw();
  }, [data]);

  // Redraw/transition dynamic elements when resizing/updating
  const redraw = (transitionSpeed = 400) => {
    const chart = D3.select(chartRef.current);
    width.current = parseInt(chart.style("width"));

    const x = D3.scaleLinear()
      .domain([0, 60])
      .range([xMargin + barPadding, width.current - xMargin]);
    const barCount = chart.selectAll(".bar").size();

    chart
      .select("#rightAxis")
      .attrs({
        x2: width - xMargin * 2,
      })
      .attr("transform", `translate(${width.current - xMargin},0)`);

    chart
      .select("#yGrid")
      .transition()
      .duration(transitionSpeed)
      .call(
        D3.axisRight(y.current)
          .ticks(10)
          .tickSize(width.current)
          .tickFormat(D3.format(".0%"))
      );

    chart.select("#contentClip rect").attrs({
      width: width.current - xMargin * 2,
    });

    chart
      .select("#heavyLoadLine")
      .transition()
      .duration(transitionSpeed)
      .attrs({
        x2: width.current - xMargin,
        y1: y.current(1),
        y2: y.current(1),
      });

    chart
      .selectAll(".bar")
      .attrs({
        width: (width.current - xMargin) / 60 - barPadding,
      })
      .transition()
      .duration(transitionSpeed)
      .attrs({
        x: (d, i) => x(i + (60 - barCount)),
        y: (d) => y.current(d.value),
        height: (d) => height - yMargin - y.current(d.value),
      });

    chart
      .selectAll(".heavyLoadMarker")
      .attrs({
        width: (width.current - xMargin) / 60,
      })
      .transition()
      .duration(transitionSpeed)
      .attrs({
        height: (d) => (d.heavyLoad ? height - yMargin : 0),
        x: (d, i) => x(i + (60 - barCount)) - barPadding / 2,
      });

    chart
      .selectAll(".xTick")
      .transition()
      .duration(transitionSpeed)
      .attrs({
        transform: (d, i) =>
          `translate(${x(i + (60 - barCount)) + 5},${
            height - yMargin + 10
          }) rotate(50)`,
      })
      .styles({ opacity: width.current > 980 ? 1 : 0 });
  };

  return (
    <div>
      <svg
        width="100%"
        height={height + 200}
        ref={chartRef}
        style={{ "min-width": "400px" }}
      />
    </div>
  );
}
