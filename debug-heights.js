// Copy this entire file content and paste into browser console
// This will help debug the height difference between profile card and quick info panel

(() => {
  // Find the profile card (photo panel)
  const profileCard = document.querySelector('[class*="profileCardDesktop"]') || 
    Array.from(document.querySelectorAll('div')).find(el => 
      el.className.includes('r-width-gofc3a') && 
      el.className.includes('r-padding-d23pfw'));
  
  // Find the quick info panel
  const quickInfo = Array.from(document.querySelectorAll('div')).find(el => 
    el.className.includes('r-flex-13awgt0') && 
    el.className.includes('r-marginLeft-1rngwi6') &&
    el.querySelector('[dir="auto"]')?.textContent === 'Quick Info');
  
  if (profileCard && quickInfo) {
    const profileRect = profileCard.getBoundingClientRect();
    const quickRect = quickInfo.getBoundingClientRect();
    
    console.log('=================================');
    console.log('PANEL HEIGHT COMPARISON');
    console.log('=================================');
    
    console.log('Profile Card (Photo Panel):');
    console.log('  Height:', profileRect.height, 'px');
    console.log('  Top:', profileRect.top, 'px');
    console.log('  Bottom:', profileRect.bottom, 'px');
    
    console.log('\nQuick Info Panel:');
    console.log('  Height:', quickRect.height, 'px');
    console.log('  Top:', quickRect.top, 'px');
    console.log('  Bottom:', quickRect.bottom, 'px');
    
    console.log('\n=================================');
    console.log('HEIGHT DIFFERENCE:', profileRect.height - quickRect.height, 'px');
    console.log('=================================');
    
    // Get computed styles for more detail
    const profileStyles = window.getComputedStyle(profileCard);
    const quickStyles = window.getComputedStyle(quickInfo);
    
    console.log('\nProfile Card Padding:');
    console.log('  Top:', profileStyles.paddingTop);
    console.log('  Bottom:', profileStyles.paddingBottom);
    
    console.log('\nQuick Info Padding:');
    console.log('  Top:', quickStyles.paddingTop);
    console.log('  Bottom:', quickStyles.paddingBottom);
    
    // Highlight the elements
    profileCard.style.outline = '3px solid red';
    quickInfo.style.outline = '3px solid blue';
    
    console.log('\n(Red outline = Profile Card, Blue outline = Quick Info)');
    console.log('=================================');
    
    return {
      profileHeight: profileRect.height,
      quickInfoHeight: quickRect.height,
      difference: profileRect.height - quickRect.height
    };
  } else {
    console.log('ERROR: Could not find one or both panels');
    console.log('Profile Card found:', !!profileCard);
    console.log('Quick Info found:', !!quickInfo);
    
    // Try to find them with alternative selectors
    console.log('\nTrying alternative selectors...');
    const allDivs = Array.from(document.querySelectorAll('div'));
    const possibleProfile = allDivs.find(el => el.textContent.includes('Ellie') && el.textContent.includes('Age:'));
    const possibleQuick = allDivs.find(el => el.textContent === 'Quick Info');
    
    if (possibleProfile) {
      console.log('Found possible profile card parent');
      possibleProfile.style.outline = '3px dashed orange';
    }
    if (possibleQuick) {
      console.log('Found possible quick info header');
      possibleQuick.parentElement.parentElement.style.outline = '3px dashed green';
    }
  }
})();