const Pen = (ctx) => {

    let pen_is_down = false;
    let pen_col = '#000f';
    let pen_size = 2;
    let prev_x, prev_y,
        curr_x, curr_y;

    const draw = () => {
        ctx.beginPath();
        ctx.moveTo(prev_x, prev_y);
        ctx.lineTo(curr_x, curr_y);
        ctx.strokeStyle = pen_col;
        ctx.lineWidth = pen_size;
        ctx.lineCap = "round";
        ctx.stroke();
    }

    const up = () => { pen_is_down = false; }
    const down = () => {
        pen_is_down = true;
        [prev_x, prev_y] = [curr_x, curr_y];
        draw();
    }
    const dot = () => { down(); up(); }
    const isDown = () => pen_is_down;

    const goto = (x, y) => {
        [curr_x, curr_y] = [x, y];
        if (pen_is_down) draw();
        [prev_x, prev_y] = [x, y];
    }
    const move = (dx, dy) => {
        curr_x += dx; curr_y += dy;
        if (pen_is_down) draw();
        [prev_x, prev_y] = [curr_x, curr_y];
    }
    const pos = () => ({ x: curr_x, y: curr_y });

    const color = (c) => {
        if (typeof c == 'number')
            pen_col = `#${c.toString(16).padStart(6, '0').padEnd(8, 'f')}`;
        else pen_col = c;
    }
    const size = (size) => { pen_size = size; }

    return {
        up, down, dot, goto, move, pos, color, size, isDown
    }
};