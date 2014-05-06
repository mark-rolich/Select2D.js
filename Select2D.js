/**
* Select2D is a javascript package which transforms HTML <select> controls to tables.
* Supports multi-select using Ctrl, Shift and click-and-drag for select boxes with multiple selection enabled.
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
var Select2D = function (src) {
    "use strict";

    this.changeIdx = null;
    this.changeVal = null;
    this.changeTxt = null;

    var obj = this,
        doc = document,
        opt = {
            src: null,
            len: 0,
            id: '',
            parent: null,
            data: [],
            selectedBtnIds: {},
            lastIdx: -1,
            isStarted: false,
            isMulti: false,
            debug: false,
            moveTimeout: null,
            moveStopTime: 0,
            isOut: false,
            getSelected: function (type) {
                var i = 0,
                    res,
                    selIdx = opt.src.selectedIndex;

                if (opt.isMulti === true) {
                    res = [];

                    for (i; i < opt.len; i += 1) {
                        if (opt.src.options[i].selected === true) {
                            switch (type) {
                            case 'idx':
                                res.push(i);
                                break;
                            case 'val':
                                res.push(opt.src.options[i].value);
                                break;
                            case 'txt':
                                res.push(opt.src.options[i].text);
                                break;
                            }
                        }
                    }
                } else {
                    switch (type) {
                    case 'idx':
                        res = selIdx;
                        break;
                    case 'val':
                        res = opt.src.options[selIdx].value;
                        break;
                    case 'txt':
                        res = opt.src.options[selIdx].text;
                        break;
                    }
                }

                return res;
            },
            change: function () {
                if (obj.changeIdx !== null) {
                    obj.changeIdx(opt.getSelected('idx'));
                }

                if (obj.changeVal !== null) {
                    obj.changeVal(opt.getSelected('val'));
                }

                if (obj.changeTxt !== null) {
                    obj.changeTxt(opt.getSelected('txt'));
                }
            }
        },
        highlight = function (idx) {
            var btn = doc.getElementById('s2d-cell-' + opt.id + '-' + idx);

            btn.className = 'selected';
            opt.src.options[idx].selected = true;
            opt.selectedBtnIds[idx] = 1;
        },
        diminish = function (idx) {
            var btn = doc.getElementById('s2d-cell-' + opt.id + '-' + idx);

            btn.removeAttribute('class');
            opt.src.options[idx].selected = false;
            delete opt.selectedBtnIds[idx];
        },
        diminishAll = function (isReset) {
            var idx;

            for (idx in opt.selectedBtnIds) {
                if (opt.selectedBtnIds.hasOwnProperty(idx)) {
                    diminish(idx);
                }
            }

            if (opt.isMulti === false && isReset === true) {
                highlight(0);
            }
        },
        selectOne = function (idx) {
            diminishAll(false);
            highlight(idx);
            opt.change();
        },
        selectMultiple = function (idx) {
            var btn = doc.getElementById('s2d-cell-' + opt.id + '-' + idx);

            if (btn.className === 'selected') {
                diminish(idx);
            } else {
                highlight(idx);
            }

            opt.change();
        },
        selectRange = function (idx) {
            var start = 0,
                finish = 0,
                i;

            if (idx > opt.lastIdx) {
                start = opt.lastIdx;
                finish = idx;
            } else {
                start = idx;
                finish = opt.lastIdx;
            }

            for (i = start; i <= finish; i += 1) {
                highlight(i);
            }

            opt.change();
        },
        checkMove = function () {
            window.clearInterval(opt.moveTimeout);

            opt.moveTimeout = window.setInterval(function () {
                opt.moveStopTime += 0.5;

                if (opt.moveStopTime >= 0.5 && opt.isOut === true) {
                    window.clearInterval(opt.moveTimeout);
                    opt.isStarted = false;
                }
            }, 500);
        },
        clickHandler = function (e) {
            var btn = e.target,
                idx = null;

            if (btn.nodeName === 'BUTTON') {
                e.preventDefault();

                idx = parseInt(btn.getAttribute('data-idx'), 10);

                if (e.ctrlKey === true && opt.isMulti === true) {
                    selectMultiple(idx);
                } else if (e.shiftKey === true && opt.isMulti === true) {
                    selectRange(idx);
                } else {
                    selectOne(idx);
                }

                opt.lastIdx = idx;
                opt.isOut = false;
                opt.isStarted = true;
            }
        },
        moveHandler = function (e) {
            if (opt.isStarted === true) {
                opt.moveStopTime = 0;

                var btn = e.target,
                    idx = null;

                if (btn.nodeName === 'BUTTON') {
                    e.preventDefault();

                    idx = parseInt(btn.getAttribute('data-idx'), 10);

                    if (idx !== opt.lastIdx && opt.src.options[idx].selected === false) {
                        highlight(idx);

                        opt.lastIdx = idx;

                        opt.change();
                    }
                }

                checkMove();
            }
        },
        outHandler = function () {
            opt.isOut = true;
        },
        upHandler = function () {
            opt.isStarted = false;
        },
        render = function () {
            var tbl     = doc.createElement('table'),
                tbody   = doc.createElement('tbody'),
                row     = doc.createElement('tr'),
                cell    = doc.createElement('td'),
                btn     = doc.createElement('button'),
                txt     = doc.createTextNode(''),
                i       = 0,
                j       = 0,
                k       = 0;

            tbl.setAttribute('class', 's2d-tbl s2d-tbl-' + opt.id);
            btn.setAttribute('type', 'button');

            for (i; i < opt.y; i += 1) {
                row = row.cloneNode(false);

                for (j = 0; j < opt.x; j += 1) {
                    cell = cell.cloneNode(false);
                    txt = txt.cloneNode(false);

                    if (opt.data[k] !== undefined) {
                        txt.textContent = opt.data[k].txt;

                        btn = btn.cloneNode(false);
                        btn.setAttribute('data-idx', String(k));
                        btn.setAttribute('id', 's2d-cell-' + opt.id + '-' + k);

                        opt.data[k].btn = btn;

                        btn.appendChild(txt);
                        cell.appendChild(btn);
                    } else {
                        txt.textContent = '';
                        cell.appendChild(txt);
                    }

                    row.appendChild(cell);

                    k += 1;
                }

                tbody.appendChild(row);
            }

            tbl.appendChild(tbody);

            opt.parent.insertBefore(tbl, opt.src);

            for (i = 0; i < opt.len; i += 1) {
                if (opt.data[i].selected === true) {
                    obj.selectByIndex(i);
                }
            }

            if (opt.debug === false) {
                opt.src.style.display = 'none';
            }

            tbl.addEventListener('mousedown', clickHandler);

            if (opt.isMulti === true) {
                tbl.addEventListener('mousemove', moveHandler);
                tbl.addEventListener('mouseup', upHandler);
                tbl.addEventListener('mouseleave', outHandler);
            }
        },
        init = function () {
            opt.src     = src;
            opt.len     = opt.src.options.length;
            opt.id      = opt.src.getAttribute('id');
            opt.parent  = opt.src.parentNode;
            opt.x       = opt.src.getAttribute('data-x');
            opt.y       = opt.src.getAttribute('data-y');
            opt.debug   = !!(opt.src.hasAttribute('data-debug') && opt.src.getAttribute('data-debug') === 'true');
            opt.isMulti = !!(opt.src.hasAttribute('multiple'));

            var options = opt.src.getElementsByTagName('option'),
                len = options.length,
                i = 0;

            for (i; i < len; i += 1) {
                opt.data[i] = {
                    val: options[i].value,
                    txt: options[i].textContent,
                    selected: options[i].selected
                };
            }

            render();
        };

    this.selectByIndex = function (val) {
        var i = 0;

        if (typeof val === 'object' && val.length > 0) {
            for (i; i < val.length; i += 1) {
                if (opt.data[val[i]] !== undefined) {
                    if (opt.isMulti === true) {
                        selectMultiple(val[i]);
                    } else {
                        selectOne(val[i]);
                    }
                }
            }
        } else {
            if (opt.data[val] !== undefined) {
                if (opt.isMulti === true) {
                    selectMultiple(val);
                } else {
                    selectOne(val);
                }
            }
        }
    };

    this.selectByValue = function (value) {
        var i = 0;

        for (i; i < opt.data.length; i += 1) {
            if (opt.data[i].val === value) {
                if (opt.isMulti === true) {
                    selectMultiple(i);
                } else {
                    selectOne(i);
                }
            }
        }
    };

    this.selectByText = function (text) {
        var i = 0;

        for (i; i < opt.data.length; i += 1) {
            if (opt.data[i].txt === text) {
                if (opt.isMulti === true) {
                    selectMultiple(i);
                } else {
                    selectOne(i);
                }
            }
        }
    };

    this.getSelected = function (type) {
        return opt.getSelected(type);
    };

    this.reset = function () {
        diminishAll(true);
    };

    init();
};