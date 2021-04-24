//anywhere, call this function to delay the execution of something
//Using this:
//this.entity.delayedExecute( <delaytime>, <function>, this );
//it returns itself, so store it if you want something done with it

pc.Entity.prototype.delayedExecute = function (duration, f, scope) {
    // find the first available tween slot
    // we do this to avoid accidentally overwriting tweens
    var n = 0;
    while(this["delayedExecuteTween" + n])
    {
        n++;
    }
    
    // once we found an unused slot, we put a dummy tween in it
    // we're tweening dummy var m from 0 to 1, over 'duration' time.
    var id = "delayedExecuteTween" + n;
    var m;
    this[id] = this.tween(m)
        .to(1, duration, pc.Linear)
    ;
    this[id].start();
    
    // add the listener to the complete event
    // it removes itself from the slot when it's done, 
    // and executes the function with the right scope
    this[id].once("complete", function() {
        f.call(scope);
        this[id] = null;
    }, this);
    
    // return the tween, in case you want to use it for something
    return this[id];
};