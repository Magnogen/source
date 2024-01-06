const Pretty = (el) => {
  
    el.style.margin = '0.5ch';
    el.style.fontFamily = 'monospace';
    el.style.fontSize = '1.5em';
    el.style.background = '#000';
    el.style.color = '#fff';
    
    let dent = '';
  
    const print = (str) => {
        el.innerHTML += dent + str
            .replace(/&/g, '&amp;')
            .replace(/>/g, '&gt;')
            .replace(/</g, '&lt;')
            .replace(/ /g, '&nbsp;')
            .replace(/\n/g, '<br>' + dent)
            .replace(/\\\[([^\]]+)\]/g, '<span style="$1">')
            .replace(/\\/g, '</span>')
        ;
    };
    const println = (str) => {
        print(str + '\n');
    };
    
    const dentchars = '&nbsp;&nbsp;&nbsp;&nbsp;';
    const indent = (amnt=1) => {
        dent = [...Array(dent.length/dentchars.length + amnt)].map(e => dentchars).join('');
    };
    const dedent = (amnt=1) => {
        dent = [...Array(dent.length/dentchars.length - amnt)].map(e => dentchars).join('');
    };
    
    return {
        print, println,
        indent, dedent,
        dent: () => dent,
    };
  };