$(document).ready(function() {
  // TO-DO: Move this into DomContentLoaded below
  $('body').removeClass('no-js');
});

// Leaving jQuery out of it unless absolutely necessary
document.addEventListener("DOMContentLoaded", function() {
  var searchInput = document.getElementById('search-input-textarea');
  var searchTableBody = document.getElementById('search-table-body');
  var randomResultsInt = 0; // To be set later when we mock results
  var emptySearchRow = `
    <tr id="empty-history-row">
      <td colspan="3">You have no history items. Start searching!</td>
    </tr>
  `;

  // Build advanced search query as needed 
  function buildQuery() {
    var output = '';
    var qbSelectGroups = document.querySelectorAll('.query-builder--selector-group');
    // If we have multiple groups, start parens
    if (qbSelectGroups.length > 1) {
      output += '(';
    }
    for (i = 0; i < qbSelectGroups.length; ++i) {
      // If we have more than one group, 
      // Add parens and boolean.
      if (i > 0) {
        var thisGroupBoolean = qbSelectGroups[i].querySelector('[name="selector-group-boolean-select"]').value;
        output += ') ' + thisGroupBoolean + ' (';
      }
      // now find all the selectors within this selector groups
      var selectors = qbSelectGroups[i].querySelectorAll('.selector');
      for (j = 0; j < selectors.length; ++j) {
        // first get the term value
        var termInput = selectors[j].querySelector('input');

        if (termInput.value.length > 0) {
          if (j > 0) {
            var booleanSelect = selectors[j].querySelector('.boolean-select');
            output += " " + booleanSelect.value + " ";
          }
          output +=   termInput.value;
          // Only append field in brackets if one was selected
          var selectedField = selectors[j].querySelector('.search-opts').value;
          if (selectedField) {
            output += '[' + selectedField + ']';
          }
        }
      }
    }
    // If needed, close parens
    if (qbSelectGroups.length > 1) {
      output += ")";
    }
    searchInput.value = output;
    ToggleSearchButtonState();
  }

  // Add WYSIWYG entry to main search box
  function addWysiwyg() {
    var output = ''
    var bool = document.querySelector('input[name=wysiwyg-boolean]:checked');
    // If we've allowed the boolean to be enabled, then add it.
    if (!bool.disabled) {
      output = bool.value
    }
    output += document.getElementById('id-wysiwyg-field-value').value;
    // Only add fieldtype if one was selected
    var selectedFieldType = document.getElementById('id-wysiwyg-field-type').value;
    if (selectedFieldType) {
      output += '[' + selectedFieldType + ']';
    }
    searchInput.value += output;
    // Now reset the boolean state as needed.
    SetWysiwygBooleanState();
  }

  // Rather than actually running a search and bringing back search details
  // We are mocking the results.
  function mockQueryDetails() {
    let details;
    if (searchInput.value.length > 0) {
      details = 'These are not real search details AND they are faked AND ' + searchInput.value + '[MeSH Terms] OR ' + searchInput.value;
    } else {
      // This shouldn't ever appear now. But just in case...
      details = "When you run a search, we'll show the details here to help you refine your results";
    }
    return `<p class="search-details" hidden>${details}</p>`
  }

  // Populate history table with new searches as needed.
  function addToHistory() {
    // TO-DO: Read/write to localstorage??
    // TO-DO: Sanitize input and add protection against bad characters
    if (searchInput.value.length > 0) {
      // First make sure the emptyHistoryRow is not in place
      if (document.getElementById('empty-history-row')) {
        searchTableBody.innerHTML = ''
      }
      // Note that we can't populate results for this query 
      // without actually running the query. 
      let template = document.createElement('template');
      let randomResultsInt = Math.floor(Math.random() * (100000 - 1)) + 1;
      mockQueryDetails();

      var newRow = `
        <tr>
          <td class="q">
            <input type="text" readonly="readonly" value='${searchInput.value}'>
            ${mockQueryDetails()}
          </td>
          <td class="num">
            <a href="#" title="Results for this query">${randomResultsInt}</a>
          </td>
          <td class="history-controls button-group">
            <button type="button" class="action use-q action--use-query" title="Use this query">
              <span class="icon"></span>
              <span class="label-text">Use this query</span>
            </button>
            <button type="button" class="action action--edit-query edit-q" title="Edit this query">
              <span class="icon"></span>
              <span class="label-text">Edit this query</span>
            </button>
            <button type="button" class="action toggle-details" title="View details of this query">
              <span class="icon icon-info">&#9432;</span>
              <span class="label-text">View details of this query</span>
            </button>
            <button type="button" class="action action--remove-query rm-q" title="Remove this query">
              <span class="icon"></span>
              <span class="label-text">Remove this query</span>
            </button>
          </td>
        </tr>`;
      template.innerHTML = newRow.trim();
      searchTableBody.insertBefore(template.content.firstChild, searchTableBody.firstChild);
      searchInput.value = '';
    }
  }

  // Helper to toggle WYSIWYG and/or/not booleans depending on 
  // whether or not there is anything in the search box to add to
  function SetWysiwygBooleanState() {
    var wysiwygField = document.getElementById('id-wysiwyg-field-value');
    // fail fast:
    if (!wysiwygField) {
      return
    }
    var wysiwygBooleanInputs = document.querySelectorAll('.fieldset--radio.button-group input');
    var wysiwygSubmit = document.querySelector('.query-builder--toolbar [type=submit]');
    
    // Make wysiwyg toolbar booleans disabled until you'd be adding to something in a query
    if (searchInput.value.length > 0) {
      wysiwygBooleanInputs.forEach( (input) =>{
        input.disabled = false;
      });
    } else {
      wysiwygBooleanInputs.forEach( (input) =>{
        input.disabled = true;
      });
    }
    // Submit button should be disabled until there is input in the query builder toolbar
    if (wysiwygField.value.length > 0) {
      wysiwygSubmit.disabled = false;
    } else {
      wysiwygSubmit.disabled = true;
    }
    // and check and see if the other buttons should be disabled,
    // based on whether or not there's anything in searchInput
    ToggleSearchButtonState();
  }
  SetWysiwygBooleanState();

  // Toggles add to history and search button state
  // Based on presence of content in searchinput
  function ToggleSearchButtonState() {
    var buttons = document.querySelectorAll('.query-preview button');
    if (searchInput.value.length > 0) {
      buttons.forEach( (input) =>{
        input.disabled = false;
      });
    } else {
      buttons.forEach( (input) =>{
        input.disabled = true;
      });
    }
  }
  ToggleSearchButtonState();

  // Make history items pop into query box.
  // TO-DO: sort out "and/or/nor" options
  $(document).on( "click",  'button.use-q', function(e) {
    var thisInput = this.closest('tr').querySelector('input[type=text]');
    if (searchInput.value.length > 0) {
      searchInput.value += ' AND '
    }
    searchInput.value += thisInput.value;
  });

  // Remove history items
  $(document).on( "click",  'button.rm-q', function(e) {
    var row = this.parentElement.parentElement;
    row.parentElement.removeChild(row);
    // Now check the row count and add "no items" if needed.
    var historyRowCount = searchTableBody.querySelectorAll('tr').length;
    if (historyRowCount == 0) {
      searchTableBody.innerHTML = emptySearchRow;
    }
  });

  // Edit history items
  $(document).on( "click",  'button.edit-q', function(e) {
    var thisInput = this.closest('tr').querySelector('input[type=text]');
    if (thisInput.hasAttribute('readonly') == true) {
      thisInput.removeAttribute('readonly');
      thisInput.focus();
    } else { // Reset on second click
      thisInput.setAttribute('readonly', 'readonly');
    }
  });

  // Add to history table event handler
  $(document).on( "click",  'button.action--add-to-history', function(e) {
    addToHistory();
    e.preventDefault();
  });

  // make history download "work"
  document.getElementById('history-download').addEventListener("click", function(e){
    alert("Your download would be happening now if this weren't a prototype.");
  });
  // Make history clear "work"
  document.getElementById('history-clear').addEventListener("click", function(e){
    searchTableBody.innerHTML = emptySearchRow;
  });
  // Toggle search details
  $(document).on( "click",  'button.toggle-details', function(e) {
    var thisDetails = this.closest('tr').querySelector('.search-details');
    if (thisDetails.hasAttribute('hidden') == true) {
      thisDetails.removeAttribute('hidden');
    } else { // Reset on second click
      thisDetails.setAttribute('hidden', 'hidden');
    }
  });
  
  // ADVANCED SEARCH ********************************

  // Search/form submission
  document.querySelector('.query-preview [type=submit]').addEventListener("click", function(e) {
    addToHistory();
    searchInput.value = '';
    alert(`
      Normally you would go to search results after clicking "search".
      For testing purposes we're going to keep you on this page.
      Note that your history has been updated with your search terms. 
      `);
    e.preventDefault();
  })

  // Set up and toggle advanced search readonly state
  if (document.querySelector('.layout--advanced-search')) {
    var editButtonElem = document.createElement('template');
    var editButton = `
      <button type="button" class="action action--edit-query" id="edit-query-button">
        Edit
      </button>
    `;
    editButtonElem.innerHTML = editButton.trim();
    searchInput.after(editButtonElem.content.firstChild);
    searchInput.setAttribute('readonly', 'readonly');
    
    // now add toggle listener
    document.getElementById('edit-query-button').addEventListener("click", function(e){
      if (searchInput.hasAttribute('readonly') == true) {
        searchInput.removeAttribute('readonly');
        searchInput.focus();
      } else {
        searchInput.setAttribute('readonly', 'readonly');
      }
    });

    // Finally, since we're already making advanced search adjustments, 
    // Adjust placeholder text for this layout
    searchInput.setAttribute('placeholder', "Type a search, or use the builder below to get started.");
  }

  // Add new selector group row
  $(document).on( "click",  'button.selector-row-add', function() {
    var newRow = `
      <fieldset class="query-builder--selector-group">
        <select class="boolean-select" name="selector-group-boolean-select">
          <option>AND</option>
          <option>OR</option>
          <option>NOT</option>
        </select>
        <div class="selector">
          <div>
              <select class="boolean-select" name="boolean-select">
                  <option>AND</option>
                  <option>OR</option>
                  <option>NOT</option>
              </select>
          </div>
          <div>
            <label for="id-search-opts-{{ num }}">Search in</label>
            <select class="search-opts" name="search-opts-{{ num }}" id="id-search-opts-{{ num }}">
                <option value="">All Fields</option>
                <option>Affiliation</option>
                <option>Author</option>
                <option>Author - Corporate</option>
                <option>Author - First</option>
                <option>Author - Full</option>
                <option>Author - Identifier</option>
                <option>Author - Last</option>
                <option>Book</option>
                <option>Conflict of Interest Statements</option>
                <option>Date - Completion</option>
                <option>Date - Create</option>
                <option>Date - Entrez</option>
                <option>Date - MeSH</option>
                <option>Date - Modification</option>
                <option>Date - Publication</option>
                <option>EC/RN Number</option>
                <option>Editor</option>
                <option>Filter</option>
                <option>Grant Number</option>
                <option>ISBN</option>
                <option>Investigator</option>
                <option>Investigator - Full</option>
                <option>Issue</option>
                <option>Journal</option>
                <option>Language</option>
                <option>Location ID</option>
                <option>MeSH Major Topic</option>
                <option>MeSH Subheading</option>
                <option>MeSH Terms</option>
                <option>Other Term</option>
                <option>Pagination</option>
                <option>Pharmacological Action</option>
                <option>Publication Type</option>
                <option>Publisher</option>
                <option>Secondary Source ID</option>
                <option>Subject - Personal Name</option>
                <option>Supplementary Concept</option>
                <option>Text Word</option>
                <option>Title</option>
                <option>Title/Abstract</option>
                <option>Transliterated Title</option>
                <option>Volume</option>
            </select>
          </div>
          <div>
            <label for="id-search-term-{{ num }}">Search for</label>
            <input type="text" name="search-term-{{ num }}" id="id-search-term-{{ num }}" placeholder="For..." />
          </div>
          <div class="button-group">
            <!-- Don't forget to implement show index here -->
            <button type="submit" class="action action--add-selector field-add">
              <span class="icon icon--action-add"></span>
              <span class="label-text">Add new selector</span>
            </button>
            <button type="submit" class="action action--remove-selector field-remove">
              <span class="icon icon--action-remove"></span>
              <span class="label-text">Remove this selector</span>
            </button>
          </div>
      </fieldset>`;
    this.insertAdjacentHTML('beforebegin', newRow);
    buildQuery();
  });

  // Rebuild query on selector group boolean change:
  $(document).on( "change",  '[name=selector-group-boolean-select]', function() {
    buildQuery();
  })

  // Add wysiwyg entry to search input
  $(document).on( "click",  '.query-builder--toolbar [type=submit]', function(e) {
    addWysiwyg();
    document.getElementById('id-wysiwyg-field-value').value = '';
    e.preventDefault();
  })

  /* Seach Details ************************************
  This is deprecated by new search detail handling
  // TO-DO: Handle empty query string
  // TO-DO: Hide or change on query change, since current search isn't valid anymore
  var searchDetails = document.getElementById('search-details');
  searchDetails.querySelector('summary').addEventListener("click", mockQueryDetails);
  */

  // Since ToggleSearchButtonState is called from within SetWysiwygBooleanState
  // this can do double-duty and call both.
  searchInput.addEventListener("keydown", SetWysiwygBooleanState);
  
  var wysiwygBuilderField = document.getElementById('id-wysiwyg-field-value')
  if (wysiwygBuilderField) {
    wysiwygBuilderField.addEventListener("keydown", SetWysiwygBooleanState);
  }

  // Yeah, we're totally cheating and dropping down to jquery for the event delegation.
  $(document).on( "change", '.selector select', buildQuery);
  $(document).on( "keyup",  '.selector input', buildQuery);

  // Add query row
  var fieldAdder = document.querySelectorAll('button.field-add');
  var newRow = `
    <div class="selector">
      <div>
        <select class="boolean-select" name="">
            <option>AND</option>
            <option>OR</option>
            <option>NOT</option>
        </select>
      </div>
      <div>
        <label for="id-search-opts-{{ num }}">Search in</label>
        <select class="search-opts" name="search-opts-{{ num }}" id="id-search-opts-{{ num }}">
          <option value="">All Fields</option>
          <option>Affiliation</option>
          <option>Author</option>
          <option>Author - Corporate</option>
          <option>Author - First</option>
          <option>Author - Full</option>
          <option>Author - Identifier</option>
          <option>Author - Last</option>
          <option>Book</option>
          <option>Conflict of Interest Statements</option>
          <option>Date - Completion</option>
          <option>Date - Create</option>
          <option>Date - Entrez</option>
          <option>Date - MeSH</option>
          <option>Date - Modification</option>
          <option>Date - Publication</option>
          <option>EC/RN Number</option>
          <option>Editor</option>
          <option>Filter</option>
          <option>Grant Number</option>
          <option>ISBN</option>
          <option>Investigator</option>
          <option>Investigator - Full</option>
          <option>Issue</option>
          <option>Journal</option>
          <option>Language</option>
          <option>Location ID</option>
          <option>MeSH Major Topic</option>
          <option>MeSH Subheading</option>
          <option>MeSH Terms</option>
          <option>Other Term</option>
          <option>Pagination</option>
          <option>Pharmacological Action</option>
          <option>Publication Type</option>
          <option>Publisher</option>
          <option>Secondary Source ID</option>
          <option>Subject - Personal Name</option>
          <option>Supplementary Concept</option>
          <option>Text Word</option>
          <option>Title</option>
          <option>Title/Abstract</option>
          <option>Transliterated Title</option>
          <option>Volume</option>
        </select>
      </div>
      <div>
        <label for="id-search-term-{{ num }}">Search for</label>
        <input type="text" name="search-term-{{ num }}" id="id-search-term-{{ num }}" placeholder="For..." />
      </div>
      <div class="button-group">
        <!-- We are not ready to implment this.
        <button type="submit" class="action action--show-index">
          <span class="icon icon--action-show-index"></span>
          <span class="label-text">Show index</span>
        </button>
        -->
        <button type="submit" class="action action--add-selector field-add">
          <span class="icon icon--action-add"></span>
          <span class="label-text">Add new selector</span>
        </button>
        <button type="submit" class="action action--remove-selector field-remove">
          <span class="icon icon--action-remove"></span>
          <span class="label-text">Remove this selector</span>
        </button>
      </div>
    </div>`;
  $(document).on( "click", '.field-add', function(e){
    e.preventDefault();
    this.parentNode.parentNode.insertAdjacentHTML('afterend', newRow);
    buildQuery();
  });
});