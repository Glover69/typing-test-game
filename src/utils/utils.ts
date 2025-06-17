export function styleMultiplayerCursor(cursorEl: HTMLElement, color: string): void {
    // Style the main cursor element
    cursorEl.style.width = '2px';
    cursorEl.style.height = '20px';
    cursorEl.style.backgroundColor = color;
    cursorEl.style.borderRadius = '1px';
    cursorEl.style.boxShadow = `0 0 8px ${color}40`; // Add glow effect
    cursorEl.style.transition = 'all 0.2s ease';
    cursorEl.style.position = 'absolute';
    cursorEl.style.zIndex = '1000';
  
    // Style the player name tag
    const nameTag = cursorEl.querySelector('.player-name-tag') as HTMLElement;
    if (nameTag) {
      nameTag.style.position = 'absolute';
      nameTag.style.top = '-25px';
      nameTag.style.left = '50%';
      nameTag.style.transform = 'translateX(-50%)';
      nameTag.style.backgroundColor = color;
      nameTag.style.color = '#ffffff';
      nameTag.style.padding = '2px 6px';
      nameTag.style.borderRadius = '4px';
      nameTag.style.fontSize = '10px';
      nameTag.style.fontWeight = 'bold';
      nameTag.style.whiteSpace = 'nowrap';
      nameTag.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      
      // Add a small arrow pointing down
      nameTag.style.setProperty('--arrow-color', color);
      nameTag.classList.add('cursor-arrow');
    }
}




export const playerColors: Map<string, string> = new Map();

// Add this method to generate consistent colors for each player
export function generatePlayerColor(playerName: string): string {
    // Check if we already have a color for this player
    if (playerColors.has(playerName)) {
      return playerColors.get(playerName)!;
    }
  
    // Generate a random bright color
    const colors = [
      '#FF6B6B', // Red
      '#4ECDC4', // Teal
      '#45B7D1', // Blue
      '#96CEB4', // Green
      '#FFEAA7', // Yellow
      '#DDA0DD', // Plum
      '#98D8C8', // Mint
      '#F7DC6F', // Light Yellow
      '#BB8FCE', // Light Purple
      '#85C1E9', // Light Blue
      '#F8C471', // Orange
      '#82E0AA', // Light Green
      '#F1948A', // Light Red
      '#85CDFD', // Sky Blue
      '#FFB347'  // Peach
    ];
  
    // Use player name to generate consistent color index
    let hash = 0;
    for (let i = 0; i < playerName.length; i++) {
      hash = playerName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colorIndex = Math.abs(hash) % colors.length;
    const selectedColor = colors[colorIndex];
  
    // Store the color for this player
    playerColors.set(playerName, selectedColor);
    return selectedColor;
  }