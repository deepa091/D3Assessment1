import {
  Component,
  OnChanges,
  Input,
  ViewContainerRef,
  ViewChildren,
  Renderer2,
} from '@angular/core';

import * as d3 from 'd3';

@Component({
  selector: 'app-scatter-plot',
  templateUrl: './scatter-plot.component.html',
  styleUrls: ['./scatter-plot.component.scss'],
})
export class ScatterPlotComponent implements OnChanges {
  constructor(
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer2
  ) {}

  @Input() chartData = [];

  elem: any;

  private margin: any;
  private svg: any;
  private width: any;
  private height: any;

  ngOnChanges(): void {
    this.getChartParams();
  }
  getChartParams(): void {
    const chartContainer: any = document.getElementById('Scatterplot');

    //Chart Margin
    this.margin = {
      top: 20,
      right: 200,
      bottom: 30,
      left: 30,
    };

    //Height & Width
    const containerWidth = chartContainer.offsetWidth,
      containerHeight = chartContainer.offsetHeight;

    this.width = containerWidth - this.margin.left - this.margin.right;
    this.height = containerHeight - this.margin.top - this.margin.bottom;

    //SVG Container
    this.elem = this.viewContainerRef.element.nativeElement;

    //Remove Child Elements
    const htmlElem = document.getElementById('Scatterplot');
    if (htmlElem != null)
      if (htmlElem.hasChildNodes()) {
        htmlElem.removeChild(htmlElem.children[0]);
      }

    this.svg = d3
      .select(this.elem)
      .select('.Scatterplot')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        'translate(' + this.margin.left + ',' + this.margin.top + ')'
      );

    //Chart Function
    this.renderScatterplot();
  }
  renderScatterplot(): void {
    //---------------Variables--------------------
    const data = this.chartData;
    console.log(data);

    //sort the data by date
    data.sort((a: any, b: any) => {
      return a['Year'] - b['Year'];
    });

    //---------Chart Code----------------------
    const myColor = d3.scaleOrdinal(d3.schemeCategory10);

    const x = d3.scaleLinear().range([0, this.width]),
      y = d3.scaleLinear().range([this.height, 0]);

    // create a tooltip
    const Tooltip = d3
      .select('body')
      .append('div')
      .style('opacity', 0)
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', 'none repeat scroll 0 0 #fff')
      .style('border', '1px solid silver')
      .style('padding', '10px')
      .style('text-align', 'justify')
      .style('cursor', 'pointer');

    // Scale the range of the data
    //X Axis
    const minVal: any = d3.min(data, (d) => {
      return d['Population_Density'];
    });
    const maxVal: any = d3.max(data, (d) => {
      return d['Population_Density'];
    });

    x.domain([minVal, maxVal]);
    //Y Axis
    const minVal1: any = d3.min(data, (d) => {
      return d['Population_Growth_Rate'];
    });
    const maxVal1: any = d3.max(data, (d) => {
      return d['Population_Growth_Rate'];
    });

    y.domain([minVal1, maxVal1]);

    this.svg
      .append('g')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3.axisBottom(x));
    this.svg.append('g').call(d3.axisLeft(y));

    // Add dots
    this.svg
      .append('g')
      .selectAll('dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d: any) => {
        return x(d['Population_Density']);
      })
      .attr('cy', (d: any) => {
        return y(d['Population_Growth_Rate']);
      })
      //Size of the scatters based on population
      .attr('r', (d: any) => {
        return d['Population_000s'] / 200;
      })
      //Color of Scatters based on Region
      .style('fill', (d: any, i: any) => {
        return myColor(d['Region']);
      })
      .style('fill-opacity', 0.65)
      //------Tooltip----
      //Mouseover
      .on('mouseover', (d: any) => {
        Tooltip.style('opacity', 1);
      })
      //Mouse Move
      .on('mousemove', (d: any, i: any) => {
        console.log(d);
        console.log(i);
        console.log(this);

        Tooltip.html(
          'Year: ' +
            i.Year +
            '<br/> Region:' +
            i['Region'] +
            '<br/> Country:' +
            i['Country'] +
            '<br/> Population:' +
            i['Population_000s'] +
            '<br/> Population Density:' +
            i['Population_Density'] +
            '<br/> Population Growth Rate:' +
            i['Population_Growth_Rate']
        )
          .style('left', d.pageX + 70 + 'px')
          .style('top', d.pageY + 'px');
      })
      //Mouse leave
      .on('mouseleave', (d: any) => {
        Tooltip.style('opacity', 0);
      });

    //-----------Legend-----------------
    const legendData = [...new Set(data.map((item: any) => item.Region))];

    //Shape
    this.svg
      .selectAll('mylabels')
      .data(legendData)
      .enter()
      .append('circle')
      .attr('r', 5)
      .attr('cx', this.width + 40)
      .attr('cy', (d: any, i: any) => {
        return 100 + i * 25;
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .style('fill', (d: any) => {
        return myColor(d);
      });
    //Text
    this.svg
      .selectAll('mylabels')
      .data(legendData)
      .enter()
      .append('text')
      .attr('x', this.width + 50)
      .attr('y', (d: any, i: any) => {
        return 100 + i * 25;
      }) // 100 is where the first dot appears. 25 is the distance between dots
      .style('fill', (d: any) => {
        return myColor(d);
      })
      .text((d: any) => {
        return d;
      })
      .attr('text-anchor', 'left')
      .style('alignment-baseline', 'middle');
  }
}
