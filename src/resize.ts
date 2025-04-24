interface Rect{
    width: number;
    height: number;
}

function listenResize(callback:(size: Rect, prev: Rect) => void){
    let current: Rect = {width:innerHeight ,height:innerHeight};
    window.addEventListener("resize", () => {
        const prev = current;
        current = {width:innerHeight ,height:innerHeight}
        callback(current, prev);
    });
}

export {listenResize};
