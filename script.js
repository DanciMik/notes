document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const noteEditor = document.getElementById('note-editor');
            const textModeBtn = document.getElementById('text-mode-btn');
            const drawModeBtn = document.getElementById('draw-mode-btn');
            const saveBtn = document.getElementById('save-btn');
            const deleteBtn = document.getElementById('delete-btn');
            const newNoteBtn = document.getElementById('new-note-btn');
            const exportBtn = document.getElementById('export-btn');
            const monthFilter = document.getElementById('month-filter');
            const subjectList = document.getElementById('subject-list');
            const notesContainer = document.getElementById('notes-container');
            const newNoteModal = document.getElementById('new-note-modal');
            const addSubjectModal = document.getElementById('add-subject-modal');
            const closeModal = document.getElementById('close-modal');
            const closeSubjectModal = document.getElementById('close-subject-modal');
            const cancelNote = document.getElementById('cancel-note');
            const createNote = document.getElementById('create-note');
            const noteSubject = document.getElementById('note-subject');
            const noteTitle = document.getElementById('note-title');
            const addSubjectBtn = document.getElementById('add-subject-btn');
            const cancelSubject = document.getElementById('cancel-subject');
            const createSubject = document.getElementById('create-subject');
            const newSubjectName = document.getElementById('new-subject-name');
            const currentDate = document.getElementById('current-date');
            const totalNotesEl = document.getElementById('total-notes');
            const activeSubjectEl = document.getElementById('active-subject');
            const currentNoteTitleEl = document.getElementById('current-note-title');
            const drawingTools = document.getElementById('drawing-tools');
            const drawingCanvas = document.getElementById('drawing-canvas');
            const clearDrawingBtn = document.getElementById('clear-drawing-btn');
            const notebookPaper = document.getElementById('notebook-paper');
            const penTools = document.querySelectorAll('.pen-tool');
            const colorPickers = document.querySelectorAll('.color-picker');
            const statusMessage = document.getElementById('status-message');

            // Canvas Context
            const ctx = drawingCanvas.getContext('2d');
            
            // Drawing State
            let isDrawing = false;
            let lastX = 0;
            let lastY = 0;
            let currentColor = '#ffffff';
            let currentLineWidth = 2;
            let isDrawMode = false;

            // App State
            let notes = JSON.parse(localStorage.getItem('notes')) || [];
            let customSubjects = JSON.parse(localStorage.getItem('subjects')) || [
                { id: 'math', name: 'Matematika' },
                { id: 'slovak', name: 'Slovenčina' },
                { id: 'english', name: 'Angličtina' }
            ];
            let currentNoteId = null;
            let currentSubject = 'all';

            // Initialize
            setupCanvas();
            updateDate();
            renderSubjects();
            updateSubjectSelect();
            renderNotes();
            updateStats();

            // Event Listeners
            textModeBtn.addEventListener('click', activateTextMode);
            drawModeBtn.addEventListener('click', activateDrawMode);
            saveBtn.addEventListener('click', saveCurrentNote);
            deleteBtn.addEventListener('click', deleteCurrentNote);
            newNoteBtn.addEventListener('click', openNewNoteModal);
            exportBtn.addEventListener('click', exportNotes);
            monthFilter.addEventListener('change', filterByMonth);
            closeModal.addEventListener('click', closeNewNoteModal);
            cancelNote.addEventListener('click', closeNewNoteModal);
            createNote.addEventListener('click', createNewNote);
            addSubjectBtn.addEventListener('click', openAddSubjectModal);
            closeSubjectModal.addEventListener('click', closeAddSubjectModal);
            cancelSubject.addEventListener('click', closeAddSubjectModal);
            createSubject.addEventListener('click', createNewSubject);
            clearDrawingBtn.addEventListener('click', clearDrawing);

            // Drawing Event Listeners
            drawingCanvas.addEventListener('touchstart', startDrawing);
            drawingCanvas.addEventListener('touchmove', draw);
            drawingCanvas.addEventListener('touchend', stopDrawing);
            drawingCanvas.addEventListener('mousedown', startDrawing);
            drawingCanvas.addEventListener('mousemove', draw);
            drawingCanvas.addEventListener('mouseup', stopDrawing);
            drawingCanvas.addEventListener('mouseout', stopDrawing);

            // Pen Tools
            penTools.forEach(tool => {
                tool.addEventListener('click', () => {
                    penTools.forEach(t => t.classList.remove('active'));
                    tool.classList.add('active');
                    currentLineWidth = parseInt(tool.dataset.size);
                });
            });

            // Color Pickers
            colorPickers.forEach(picker => {
                picker.addEventListener('click', () => {
                    colorPickers.forEach(p => p.classList.remove('active'));
                    picker.classList.add('active');
                    currentColor = picker.dataset.color;
                });
            });

            // Functions
            function showStatus(message, type = 'success') {
                statusMessage.textContent = message;
                statusMessage.style.background = type === 'success' ? '#fff' : '#ff4444';
                statusMessage.style.color = type === 'success' ? '#000' : '#fff';
                statusMessage.style.display = 'block';
                
                setTimeout(() => {
                    statusMessage.style.display = 'none';
                }, 2000);
            }

            function setupCanvas() {
                const rect = notebookPaper.getBoundingClientRect();
                drawingCanvas.width = rect.width;
                drawingCanvas.height = rect.height;
                
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = currentLineWidth;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }

            function startDrawing(e) {
                if (!isDrawMode) return;
                
                isDrawing = true;
                const coords = getCoordinates(e);
                [lastX, lastY] = [coords.x, coords.y];
                
                e.preventDefault();
            }

            function draw(e) {
                if (!isDrawing || !isDrawMode) return;
                
                const coords = getCoordinates(e);
                const currentX = coords.x;
                const currentY = coords.y;
                
                ctx.strokeStyle = currentColor;
                ctx.lineWidth = currentLineWidth;
                
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                [lastX, lastY] = [currentX, currentY];
                
                e.preventDefault();
            }

            function stopDrawing() {
                isDrawing = false;
            }

            function getCoordinates(e) {
                let x, y;
                
                if (e.type.includes('touch')) {
                    const touch = e.touches[0];
                    const rect = drawingCanvas.getBoundingClientRect();
                    x = touch.clientX - rect.left;
                    y = touch.clientY - rect.top;
                } else {
                    x = e.offsetX;
                    y = e.offsetY;
                }
                
                return { x, y };
            }

            function clearDrawing() {
                ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            }

            function activateTextMode() {
                isDrawMode = false;
                textModeBtn.classList.add('active');
                drawModeBtn.classList.remove('active');
                drawingTools.style.display = 'none';
                notebookPaper.classList.remove('writing-mode');
                noteEditor.contentEditable = true;
                noteEditor.style.pointerEvents = 'auto';
                showStatus('Textový režim');
            }

            function activateDrawMode() {
                isDrawMode = true;
                textModeBtn.classList.remove('active');
                drawModeBtn.classList.add('active');
                drawingTools.style.display = 'flex';
                notebookPaper.classList.add('writing-mode');
                noteEditor.contentEditable = false;
                noteEditor.style.pointerEvents = 'none';
                showStatus('Režim písania');
            }

            function updateDate() {
                const now = new Date();
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                currentDate.textContent = now.toLocaleDateString('sk-SK', options);
            }

            function saveCurrentNote() {
                if (!currentNoteId) {
                    showStatus('Vyberte poznámku', 'error');
                    return;
                }
                
                const noteIndex = notes.findIndex(note => note.id === currentNoteId);
                if (noteIndex !== -1) {
                    notes[noteIndex].content = noteEditor.innerHTML;
                    notes[noteIndex].drawing = drawingCanvas.toDataURL();
                    notes[noteIndex].lastModified = new Date().toISOString();
                    localStorage.setItem('notes', JSON.stringify(notes));
                    renderNotes();
                    showStatus('Uložené');
                }
            }

            function deleteCurrentNote() {
                if (!currentNoteId) {
                    showStatus('Vyberte poznámku', 'error');
                    return;
                }
                
                if (confirm('Vymazať poznámku?')) {
                    notes = notes.filter(note => note.id !== currentNoteId);
                    localStorage.setItem('notes', JSON.stringify(notes));
                    currentNoteId = null;
                    noteEditor.innerHTML = 'Vyberte alebo vytvorte poznámku.';
                    clearDrawing();
                    renderNotes();
                    updateStats();
                    showStatus('Vymazané');
                }
            }

            function openNewNoteModal() {
                newNoteModal.style.display = 'flex';
                noteTitle.value = '';
                noteSubject.value = customSubjects[0]?.id || '';
            }

            function closeNewNoteModal() {
                newNoteModal.style.display = 'none';
            }

            function openAddSubjectModal() {
                addSubjectModal.style.display = 'flex';
                newSubjectName.value = '';
            }

            function closeAddSubjectModal() {
                addSubjectModal.style.display = 'none';
            }

            function createNewNote() {
                const title = noteTitle.value.trim();
                const subject = noteSubject.value;
                
                if (!title) {
                    showStatus('Zadajte názov', 'error');
                    return;
                }
                
                const newNote = {
                    id: Date.now(),
                    title: title,
                    subject: subject,
                    content: '<p>Začnite písať...</p>',
                    drawing: '',
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString()
                };
                
                notes.unshift(newNote);
                localStorage.setItem('notes', JSON.stringify(notes));
                closeNewNoteModal();
                renderNotes();
                loadNote(newNote.id);
                updateStats();
                showStatus('Poznámka vytvorená');
            }

            function createNewSubject() {
                const subjectName = newSubjectName.value.trim();
                
                if (!subjectName) {
                    showStatus('Zadajte názov', 'error');
                    return;
                }
                
                const subjectId = 'custom-' + Date.now();
                customSubjects.push({
                    id: subjectId,
                    name: subjectName
                });
                
                localStorage.setItem('subjects', JSON.stringify(customSubjects));
                closeAddSubjectModal();
                renderSubjects();
                updateSubjectSelect();
                showStatus('Predmet pridaný');
            }

            function exportNotes() {
                if (notes.length === 0) {
                    showStatus('Žiadne poznámky', 'error');
                    return;
                }
                
                const dataStr = JSON.stringify(notes, null, 2);
                const dataBlob = new Blob([dataStr], {type: 'application/json'});
                
                const link = document.createElement('a');
                link.href = URL.createObjectURL(dataBlob);
                link.download = 'poznamky.json';
                link.click();
                showStatus('Exportované');
            }

            function filterByMonth() {
                renderNotes();
            }

            function renderSubjects() {
                const allNotesItem = '<li class="subject-item active" data-subject="all"><i class="fas fa-star"></i> Všetky</li>';
                const customItems = customSubjects.map(subject => 
                    `<li class="subject-item" data-subject="${subject.id}"><i class="fas fa-book"></i> ${subject.name}</li>`
                ).join('');
                
                subjectList.innerHTML = allNotesItem + customItems;
                
                document.querySelectorAll('.subject-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const subject = item.dataset.subject;
                        currentSubject = subject;
                        
                        document.querySelectorAll('.subject-item').forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        
                        if (subject === 'all') {
                            activeSubjectEl.textContent = 'Všetky';
                        } else {
                            const subjectObj = customSubjects.find(s => s.id === subject);
                            activeSubjectEl.textContent = subjectObj ? subjectObj.name : 'Neznámy';
                        }
                        
                        renderNotes();
                    });
                });
            }

            function updateSubjectSelect() {
                noteSubject.innerHTML = customSubjects.map(subject => 
                    `<option value="${subject.id}">${subject.name}</option>`
                ).join('');
            }

            function renderNotes() {
                let filteredNotes = notes;
                const selectedMonth = monthFilter.value;
                
                if (currentSubject !== 'all') {
                    filteredNotes = filteredNotes.filter(note => note.subject === currentSubject);
                }
                
                if (selectedMonth !== 'all') {
                    const month = parseInt(selectedMonth);
                    filteredNotes = filteredNotes.filter(note => {
                        const noteDate = new Date(note.createdAt);
                        return noteDate.getMonth() === month;
                    });
                }
                
                if (filteredNotes.length === 0) {
                    notesContainer.innerHTML = '<div class="empty-state">Žiadne poznámky</div>';
                    return;
                }
                
                const notesHTML = filteredNotes.map(note => {
                    const date = new Date(note.createdAt);
                    const formattedDate = `${date.getDate()}. ${date.getMonth() + 1}. ${date.getFullYear()}`;
                    
                    const subject = customSubjects.find(s => s.id === note.subject);
                    const subjectName = subject ? subject.name : 'Neznámy';
                    
                    return `
                        <div class="note-card ${note.id === currentNoteId ? 'active' : ''}" data-id="${note.id}">
                            <div class="note-card-header">
                                <div class="note-subject">${subjectName}</div>
                                <div class="note-card-date">${formattedDate}</div>
                            </div>
                            <div class="note-preview">${note.title}</div>
                        </div>
                    `;
                }).join('');
                
                notesContainer.innerHTML = notesHTML;
                
                document.querySelectorAll('.note-card').forEach(card => {
                    card.addEventListener('click', () => {
                        const noteId = parseInt(card.dataset.id);
                        loadNote(noteId);
                    });
                });
                
                updateStats();
            }

            function loadNote(noteId) {
                const note = notes.find(note => note.id === noteId);
                if (note) {
                    currentNoteId = noteId;
                    noteEditor.innerHTML = note.content || '<p>Začnite písať...</p>';
                    
                    if (note.drawing) {
                        const img = new Image();
                        img.onload = function() {
                            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
                            ctx.drawImage(img, 0, 0);
                        };
                        img.src = note.drawing;
                    } else {
                        clearDrawing();
                    }
                    
                    document.querySelectorAll('.note-card').forEach(card => {
                        card.classList.toggle('active', parseInt(card.dataset.id) === noteId);
                    });
                    
                    currentNoteTitleEl.textContent = note.title;
                }
            }

            function updateStats() {
                totalNotesEl.textContent = notes.length;
            }

            // Handle window resize
            window.addEventListener('resize', setupCanvas);

            // Start in text mode
            activateTextMode();
        });