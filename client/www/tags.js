import $ from 'jquery';

// console.log('asdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdfasdf');



;(function tagGridSetup() {
  
  let inverted = false, indeterminate = false;

  const grid = $('vaadin-grid#tagGrid')[0];

  // console.log($(grid).children())

  const column = ($(grid).children()[0]);

  // // console.log('asdfasdfasdfasdf')
  ($(grid).children()[1]).headerRenderer = function (root) {
    root.innerHTML = '<vaadin-grid-sorter path="name">Name</vaadin-grid-sorter>';
  };

  ($(grid).children()[2]).headerRenderer = function (root) {
    root.innerHTML = '<vaadin-grid-sorter path="videos.length">Videos</vaadin-grid-sorter>';
  };

  ($(grid).children()[3]).headerRenderer = function (root) {
    root.innerHTML = '<vaadin-grid-sorter path="aliases.length">Aliases</vaadin-grid-sorter>';
  };


  column.headerRenderer = function(cell) {
    var checkbox = cell.firstElementChild;
    if (!checkbox) {
      checkbox = window.document.createElement('vaadin-checkbox');
      checkbox.setAttribute('aria-label', 'Select All');
      checkbox.setAttribute('style', 'font-size: var(--lumo-font-size-m)');
      checkbox.addEventListener('change', function(e) {
        grid.selectedItems = [];
        inverted = !inverted;
        indeterminate = false;
        grid.render();
      });
      cell.appendChild(checkbox);
    }
    checkbox.checked = indeterminate || inverted;
    checkbox.indeterminate = indeterminate;
  };

  column.renderer = function(cell, column, rowData) {
    var checkbox = cell.firstElementChild;
    if (!checkbox) {
      checkbox = window.document.createElement('vaadin-checkbox');
      checkbox.setAttribute('aria-label', 'Select Row');
      checkbox.addEventListener('change', function(e) {
        if (e.target.checked === inverted) {
          grid.deselectItem(checkbox.__item);
        } else {
          grid.selectItem(checkbox.__item);
        }
        indeterminate = grid.selectedItems.length > 0;
        grid.render();
      });
      cell.appendChild(checkbox);
    }
    checkbox.__item = rowData.item;
    checkbox.checked = inverted !== rowData.selected;
  };

})()


;(function aliasGridSetup() {
  
  let inverted = false, indeterminate = false;

  const grid = $('vaadin-grid#aliasGrid')[0];

  const column = ($(grid).children()[0]);

  column.headerRenderer = function(cell) {
    var checkbox = cell.firstElementChild;
    if (!checkbox) {
      checkbox = window.document.createElement('vaadin-checkbox');
      checkbox.setAttribute('aria-label', 'Select All');
      checkbox.setAttribute('style', 'font-size: var(--lumo-font-size-m)');
      checkbox.addEventListener('change', function(e) {
        grid.selectedItems = [];
        inverted = !inverted;
        indeterminate = false;
        grid.render();
      });
      cell.appendChild(checkbox);
    }
    checkbox.checked = indeterminate || inverted;
    checkbox.indeterminate = indeterminate;
  };

  column.renderer = function(cell, column, rowData) {
    var checkbox = cell.firstElementChild;
    if (!checkbox) {
      checkbox = window.document.createElement('vaadin-checkbox');
      checkbox.setAttribute('aria-label', 'Select Row');
      checkbox.addEventListener('change', function(e) {
        if (e.target.checked === inverted) {
          grid.deselectItem(checkbox.__item);
        } else {
          grid.selectItem(checkbox.__item);
        }
        indeterminate = grid.selectedItems.length > 0;
        grid.render();
      });
      cell.appendChild(checkbox);
    }
    checkbox.__item = rowData.item;
    checkbox.checked = inverted !== rowData.selected;
  };

})()


ajax('/tagAliases').done((data) => {

  const listsArr = JSON.parse(data);
  
  $('vaadin-grid#tagGrid')[0].items = listsArr;

  // console.dir(listsArr)

})

ajax('/aliases').done((data) => {

  const aliases = JSON.parse(data);
  
  $('vaadin-grid#aliasGrid')[0].items = aliases;

  // console.dir(listsArr)

})