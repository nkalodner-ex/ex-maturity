export interface HeatmapCategory {
  name: string;
  score: number;
  changes: number[]; // Change values for each comparison group
}

export interface HeatmapData {
  title: string;
  totalResponses: number;
  comparisonGroups: {
    name: string;
    responses: number;
  }[];
  categories: HeatmapCategory[];
}

export const mockHeatmapData: HeatmapData = {
  title: 'Category Scores by Department',
  totalResponses: 4000,
  comparisonGroups: [
    { name: 'Engineering', responses: 422 },
    { name: 'Sales', responses: 1191 },
    { name: 'Marketing', responses: 1030 },
  ],
  categories: [
    { name: 'Engagement', score: 22, changes: [1, 1, 0] },
    { name: 'Inclusion', score: 70, changes: [2, -1, 1] },
    { name: 'Intent to Stay', score: 40, changes: [2, 0, -2] },
    { name: 'Well-being', score: 46, changes: [0, 0, 0] },
    { name: 'Corporate Social Responsibility', score: 21, changes: [0, 0, 0] },
    { name: 'Customer Focus', score: 7, changes: [-1, 1, -1] },
    { name: 'Growth & Development', score: 41, changes: [3, -3, 1] },
    { name: 'Innovation', score: 58, changes: [2, 0, -1] },
    { name: 'Job Fundamentals', score: 50, changes: [0, 0, -1] },
    { name: 'Leadership', score: 28, changes: [0, 0, 1] },
    { name: 'Manager Effectiveness', score: 31, changes: [-2, 0, -1] },
    { name: 'Organizational Agility', score: 45, changes: [1, 0, 0] },
    { name: 'Performance & Rewards', score: 10, changes: [0, 1, -1] },
    { name: 'Psych Safety', score: 5, changes: [-1, 0, 0] },
    { name: 'Survey Follow Up', score: 70, changes: [-1, -2, 0] },
    { name: 'Work Life Balance', score: 70, changes: [-1, -1, 0] },
  ],
};

// Second heatmap for variety
export const mockHeatmapData2: HeatmapData = {
  title: 'Scores by Location',
  totalResponses: 2500,
  comparisonGroups: [
    { name: 'HQ', responses: 1200 },
    { name: 'Remote', responses: 800 },
    { name: 'Field', responses: 500 },
  ],
  categories: [
    { name: 'Engagement', score: 35, changes: [2, 0, -1] },
    { name: 'Manager Effectiveness', score: 42, changes: [1, 3, -2] },
    { name: 'Growth & Development', score: 28, changes: [-1, 2, 0] },
    { name: 'Work Life Balance', score: 55, changes: [0, 4, -3] },
    { name: 'Recognition & Respect', score: 48, changes: [1, 1, 0] },
  ],
};
