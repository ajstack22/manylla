/* eslint-disable */
import {
  defaultQuickInfoPanels,
  getVisibleQuickInfo,
  getQuickInfoByName
} from '../defaultQuickInfo';

describe('defaultQuickInfo', () => {
  describe('defaultQuickInfoPanels', () => {
    test('is an array', () => {
      expect(Array.isArray(defaultQuickInfoPanels)).toBe(true);
    });

    test('contains expected number of panels', () => {
      expect(defaultQuickInfoPanels.length).toBeGreaterThan(0);
    });

    test('all panels have required properties', () => {
      defaultQuickInfoPanels.forEach(panel => {
        expect(panel).toHaveProperty('id');
        expect(panel).toHaveProperty('name');
        expect(panel).toHaveProperty('displayName');
        expect(panel).toHaveProperty('value');
        expect(panel).toHaveProperty('order');
        expect(panel).toHaveProperty('isVisible');
        expect(panel).toHaveProperty('isCustom');
      });
    });

    test('all panels have valid data types', () => {
      defaultQuickInfoPanels.forEach(panel => {
        expect(typeof panel.id).toBe('string');
        expect(typeof panel.name).toBe('string');
        expect(typeof panel.displayName).toBe('string');
        expect(typeof panel.value).toBe('string');
        expect(typeof panel.order).toBe('number');
        expect(typeof panel.isVisible).toBe('boolean');
        expect(typeof panel.isCustom).toBe('boolean');
      });
    });

    test('contains communication panel', () => {
      const communicationPanel = defaultQuickInfoPanels.find(p => p.id === 'communication');
      expect(communicationPanel).toBeDefined();
      expect(communicationPanel.displayName).toBe('Communication');
    });

    test('contains sensory panel', () => {
      const sensoryPanel = defaultQuickInfoPanels.find(p => p.id === 'sensory');
      expect(sensoryPanel).toBeDefined();
      expect(sensoryPanel.displayName).toBe('Sensory');
    });

    test('contains medical panel', () => {
      const medicalPanel = defaultQuickInfoPanels.find(p => p.id === 'medical');
      expect(medicalPanel).toBeDefined();
      expect(medicalPanel.displayName).toBe('Medical');
    });

    test('all panel IDs are unique', () => {
      const ids = defaultQuickInfoPanels.map(p => p.id);
      const uniqueIds = [...new Set(ids)];
      expect(ids.length).toBe(uniqueIds.length);
    });

    test('default panels are not custom', () => {
      defaultQuickInfoPanels.forEach(panel => {
        expect(panel.isCustom).toBe(false);
      });
    });
  });

  describe('getVisibleQuickInfo', () => {
    test('filters only visible panels', () => {
      const testPanels = [
        { id: '1', name: 'test1', isVisible: true, order: 1 },
        { id: '2', name: 'test2', isVisible: false, order: 2 },
        { id: '3', name: 'test3', isVisible: true, order: 3 },
      ];

      const visible = getVisibleQuickInfo(testPanels);
      expect(visible).toHaveLength(2);
      expect(visible.every(p => p.isVisible)).toBe(true);
    });

    test('sorts panels by order', () => {
      const testPanels = [
        { id: '1', name: 'test1', isVisible: true, order: 3 },
        { id: '2', name: 'test2', isVisible: true, order: 1 },
        { id: '3', name: 'test3', isVisible: true, order: 2 },
      ];

      const visible = getVisibleQuickInfo(testPanels);
      expect(visible[0].order).toBe(1);
      expect(visible[1].order).toBe(2);
      expect(visible[2].order).toBe(3);
    });

    test('handles empty array', () => {
      const visible = getVisibleQuickInfo([]);
      expect(visible).toHaveLength(0);
    });

    test('handles all invisible panels', () => {
      const testPanels = [
        { id: '1', name: 'test1', isVisible: false, order: 1 },
        { id: '2', name: 'test2', isVisible: false, order: 2 },
      ];

      const visible = getVisibleQuickInfo(testPanels);
      expect(visible).toHaveLength(0);
    });

    test('works with default panels', () => {
      const visible = getVisibleQuickInfo(defaultQuickInfoPanels);
      expect(visible.length).toBeGreaterThan(0);
      expect(visible.every(p => p.isVisible)).toBe(true);
    });
  });

  describe('getQuickInfoByName', () => {
    test('finds panel by name', () => {
      const testPanels = [
        { id: '1', name: 'communication', displayName: 'Communication' },
        { id: '2', name: 'sensory', displayName: 'Sensory' },
      ];

      const panel = getQuickInfoByName(testPanels, 'communication');
      expect(panel).toBeDefined();
      expect(panel.name).toBe('communication');
      expect(panel.displayName).toBe('Communication');
    });

    test('returns undefined for non-existent name', () => {
      const testPanels = [
        { id: '1', name: 'communication', displayName: 'Communication' },
      ];

      const panel = getQuickInfoByName(testPanels, 'nonexistent');
      expect(panel).toBeUndefined();
    });

    test('handles empty array', () => {
      const panel = getQuickInfoByName([], 'communication');
      expect(panel).toBeUndefined();
    });

    test('works with default panels', () => {
      const communicationPanel = getQuickInfoByName(defaultQuickInfoPanels, 'communication');
      expect(communicationPanel).toBeDefined();
      expect(communicationPanel.id).toBe('communication');

      const medicalPanel = getQuickInfoByName(defaultQuickInfoPanels, 'medical');
      expect(medicalPanel).toBeDefined();
      expect(medicalPanel.id).toBe('medical');
    });

    test('is case sensitive', () => {
      const testPanels = [
        { id: '1', name: 'Communication', displayName: 'Communication' },
      ];

      const panel = getQuickInfoByName(testPanels, 'communication');
      expect(panel).toBeUndefined();
    });
  });
});