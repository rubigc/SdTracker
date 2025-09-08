import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const ChartVisualization = ({ data, type = 'bar', title = '' }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data || data.length === 0) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart dimensions
    const chartWidth = width - 80;  // Increased margin to prevent clipping
    const chartHeight = height - 100;  // Increased margin to prevent clipping
    const chartX = 50;  // Adjusted for better margins
    const chartY = 70;  // Increased to provide more space for title

    // Find max value for scaling
    const maxValue = Math.max(...data.map(item => item.value));

    // Draw title
    if (title) {
      ctx.font = '16px Arial';
      ctx.fillStyle = '#f0f0f0';  // Changed to light color for dark mode
      ctx.textAlign = 'center';
      ctx.fillText(title, width / 2, 20);  // Moved title up
    }

    // Draw axes
    ctx.beginPath();
    ctx.moveTo(chartX, chartY);
    ctx.lineTo(chartX, chartY + chartHeight);
    ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
    ctx.strokeStyle = '#b0b0b0';
    ctx.stroke();

    // Draw grid lines and labels
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = chartY + chartHeight - (i * chartHeight / gridLines);
      const value = (maxValue * i / gridLines).toFixed(1);
      
      // Grid line
      ctx.beginPath();
      ctx.moveTo(chartX, y);
      ctx.lineTo(chartX + chartWidth, y);
      ctx.strokeStyle = '#5d5d5d';  // Adjusted for dark mode
      ctx.stroke();
      
      // Y-axis label
      ctx.font = '12px Arial';
      ctx.fillStyle = '#f0f0f0';  // Changed to light color for dark mode
      ctx.textAlign = 'right';
      ctx.fillText(value, chartX - 10, y + 4);
    }

    // Draw bars or points
    const barWidth = chartWidth / (data.length + 1);
    const barSpacing = barWidth / 2;

    data.forEach((item, index) => {
      const x = chartX + barSpacing + index * barWidth;
      const barHeight = (item.value / maxValue) * chartHeight;
      const y = chartY + chartHeight - barHeight;

      if (type === 'bar') {
        // Draw bar
        ctx.fillStyle = item.color || '#3498db';
        ctx.fillRect(x - barWidth / 4, y, barWidth / 2, barHeight);
        
        // Draw bar label
        ctx.font = '12px Arial';
        ctx.fillStyle = '#f0f0f0';  // Changed to light color for dark mode
        ctx.textAlign = 'center';
        // Check if label would be clipped and adjust position if necessary
        ctx.fillText(
          item.label, 
          x, 
          chartY + chartHeight + 20
        );
      } else if (type === 'line') {
        // Draw point
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = item.color || '#3498db';
        ctx.fill();
        
        // Draw point label
        ctx.font = '12px Arial';
        ctx.fillStyle = '#f0f0f0';  // Changed to light color for dark mode
        ctx.textAlign = 'center';
        // Check if label would be clipped and adjust position if necessary
        ctx.fillText(
          item.label, 
          x, 
          chartY + chartHeight + 20
        );
        
        // Draw line to next point
        if (index < data.length - 1) {
          const nextItem = data[index + 1];
          const nextX = chartX + barSpacing + (index + 1) * barWidth;
          const nextBarHeight = (nextItem.value / maxValue) * chartHeight;
          const nextY = chartY + chartHeight - nextBarHeight;
          
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(nextX, nextY);
          ctx.strokeStyle = item.color || '#3498db';
          ctx.stroke();
        }
      }
      
      // Draw value label
      ctx.font = '12px Arial';
      ctx.fillStyle = '#f0f0f0';  // Changed to light color for dark mode
      ctx.textAlign = 'center';
      // Check if value label would be clipped and adjust position if necessary
      ctx.fillText(
        item.value.toFixed(1), 
        x, 
        y - 10
      );
    });
  }, [data, type, title]);

  return (
    <div className="chart-container">
      <canvas
        ref={canvasRef}
        width={450}  // Increased width to provide more space
        height={370}  // Increased height to provide more space
        className="chart-canvas"
      />
    </div>
  );
};

ChartVisualization.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    color: PropTypes.string
  })).isRequired,
  type: PropTypes.oneOf(['bar', 'line']),
  title: PropTypes.string
};

export default ChartVisualization;