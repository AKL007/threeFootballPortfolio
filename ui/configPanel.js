/**
 * Config Panel UI
 * Allows play-testing of game constants through a UI panel
 */

import { UI_COLORS } from '../config/colors.js';

let configPanelVisible = false;
let configPanel = null;

// Helper function to create input fields for config values
function createConfigInput(path, value, type = 'number', step = 0.1) {
    const container = document.createElement('div');
    container.style.marginBottom = '10px';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '10px';
    
    const label = document.createElement('label');
    label.textContent = path;
    label.style.minWidth = '200px';
    label.style.fontSize = '12px';
    
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    input.step = step;
    input.style.width = '100px';
    input.style.padding = '5px';
    input.style.borderRadius = '4px';
    input.style.border = `1px solid ${UI_COLORS.CONFIG_PANEL_INPUT_BORDER}`;
    input.style.background = UI_COLORS.CONFIG_PANEL_INPUT_BG;
    input.style.color = UI_COLORS.CONFIG_PANEL_TEXT;
    
    // Update config value when input changes
    input.addEventListener('input', (e) => {
        const newValue = type === 'number' ? parseFloat(e.target.value) : e.target.value;
        updateConfigValue(path, newValue);
    });
    
    container.appendChild(label);
    container.appendChild(input);
    
    return container;
}

// Helper function to update nested config values
function updateConfigValue(path, value) {
    if (!window.GAME_CONFIG) return;
    
    const parts = path.split('.');
    let obj = window.GAME_CONFIG;
    
    // Navigate to the parent object
    for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) return;
        obj = obj[parts[i]];
    }
    
    // Update the value
    const key = parts[parts.length - 1];
    if (obj[key] !== undefined) {
        obj[key] = value;
    }
}

// Helper function to recursively create config UI
function createConfigSection(config, prefix = '', container) {
    for (const key in config) {
        const value = config[key];
        const path = prefix ? `${prefix}.${key}` : key;
        
        // Skip Vector3 and Vector2 objects (they're initialized values, not configurable)
        if (value && typeof value === 'object' && (value.isVector3 || value.isVector2)) {
            continue;
        }
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Create a section header for nested objects
            const sectionHeader = document.createElement('h3');
            sectionHeader.textContent = key;
            sectionHeader.style.marginTop = '15px';
            sectionHeader.style.marginBottom = '10px';
            sectionHeader.style.fontSize = '14px';
            sectionHeader.style.color = UI_COLORS.CONFIG_PANEL_HEADER;
            container.appendChild(sectionHeader);
            
            // Recursively create config for nested object
            createConfigSection(value, path, container);
        } else if (typeof value === 'number') {
            // Create input for number values
            const step = Math.abs(value) < 1 ? 0.01 : (Math.abs(value) < 10 ? 0.1 : 1);
            container.appendChild(createConfigInput(path, value, 'number', step));
        } else if (typeof value === 'boolean') {
            // Create checkbox for boolean values
            const containerDiv = document.createElement('div');
            containerDiv.style.marginBottom = '10px';
            containerDiv.style.display = 'flex';
            containerDiv.style.alignItems = 'center';
            containerDiv.style.gap = '10px';
            
            const label = document.createElement('label');
            label.textContent = path;
            label.style.minWidth = '200px';
            label.style.fontSize = '12px';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = value;
            checkbox.addEventListener('change', (e) => {
                updateConfigValue(path, e.target.checked);
            });
            
            containerDiv.appendChild(label);
            containerDiv.appendChild(checkbox);
            container.appendChild(containerDiv);
        }
    }
}

export function toggleConfigPanel() {
    if (!window.GAME_CONFIG) {
        console.warn('GAME_CONFIG not available. Make sure config/index.js is imported.');
        return;
    }
    
    if (!configPanel) {
        createConfigPanel();
    }
    
    configPanelVisible = !configPanelVisible;
    configPanel.style.display = configPanelVisible ? 'block' : 'none';
}

function createConfigPanel() {
    configPanel = document.createElement('div');
    configPanel.id = 'config-panel';
    configPanel.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        width: 500px;
        max-height: 80vh;
        background: ${UI_COLORS.CONFIG_PANEL_BG};
        border: 2px solid ${UI_COLORS.CONFIG_PANEL_BORDER};
        border-radius: 8px;
        padding: 20px;
        z-index: 2000;
        overflow-y: auto;
        color: ${UI_COLORS.CONFIG_PANEL_TEXT};
        font-family: 'Courier New', monospace;
        font-size: 12px;
        display: none;
    `;
    
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 10px;
        border-bottom: 1px solid ${UI_COLORS.CONFIG_PANEL_BORDER};
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'Game Config (Play-Testing)';
    title.style.margin = '0';
    title.style.fontSize = '16px';
    title.style.color = UI_COLORS.CONFIG_PANEL_HEADER;
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
        background: ${UI_COLORS.CONFIG_PANEL_CLOSE_BTN};
        border: none;
        color: ${UI_COLORS.CONFIG_PANEL_TEXT};
        width: 30px;
        height: 30px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 20px;
        line-height: 1;
    `;
    closeBtn.onclick = () => toggleConfigPanel();
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    configPanel.appendChild(header);
    
    const content = document.createElement('div');
    content.id = 'config-content';
    
    // Create config sections
    createConfigSection(window.GAME_CONFIG, '', content);
    
    configPanel.appendChild(content);
    document.body.appendChild(configPanel);
}

// Add keyboard shortcut to toggle config panel (Ctrl/Cmd + `)
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '`') {
        e.preventDefault();
        toggleConfigPanel();
    }
});

