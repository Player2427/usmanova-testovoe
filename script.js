/* =====================================================
   Demo logic: modal, form validation, toast notifications
   ===================================================== */

(function () {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(msg, type = '') {
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.className = 'toast is-show' + (type ? ' is-' + type : '');
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('is-show');
    }, 3200);
  }

  /* ---------- Modal ---------- */
  const modal = $('#modal');

  function openModal(source) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // autofocus first input
    requestAnimationFrame(() => {
      const firstInput = modal.querySelector('input, select, button');
      if (firstInput) firstInput.focus();
    });
    if (source) modal.dataset.source = source;
  }
  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  $$('.js-open-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(btn.dataset.source || 'unknown');
    });
  });
  $$('.js-close-modal').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

  /* ---------- Form validation ---------- */
  function setFieldError(field, msg) {
    const wrap = field.closest('.field');
    if (!wrap) return;
    wrap.classList.toggle('is-invalid', !!msg);
    const err = wrap.querySelector('.field-error');
    if (err) err.textContent = msg || '';
  }

  function validatePhone(value) {
    const digits = value.replace(/\D+/g, '');
    // accept +X-XXX-XXX-XX-XX or @username
    if (value.trim().startsWith('@') && value.trim().length >= 3) return true;
    return digits.length >= 10;
  }

  function validateForm(form) {
    let ok = true;
    $$('[name]', form).forEach(field => {
      if (field.type === 'checkbox') {
        if (field.required && !field.checked) {
          setFieldError(field, 'Нужно согласие');
          ok = false;
        } else setFieldError(field, '');
        return;
      }
      const v = (field.value || '').trim();
      if (field.required && !v) {
        setFieldError(field, 'Заполните поле');
        ok = false;
      } else if (field.name === 'name' && v.length < 2) {
        setFieldError(field, 'Минимум 2 символа');
        ok = false;
      } else if (field.name === 'phone' && !validatePhone(v)) {
        setFieldError(field, 'Введите телефон или @username');
        ok = false;
      } else {
        setFieldError(field, '');
      }
    });
    return ok;
  }

  function submitForm(form, opts = {}) {
    if (!validateForm(form)) {
      toast('Проверьте поля формы', 'error');
      return;
    }
    const btn = form.querySelector('button[type="submit"]');
    btn.classList.add('is-loading');
    btn.disabled = true;

    // Симуляция отправки (для GitHub Pages — статический сайт)
    setTimeout(() => {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      form.reset();
      toast('Заявка принята! Напишем в течение 15 минут ✓', 'success');
      if (opts.closeModal) closeModal();
    }, 900);
  }

  const helpForm = $('#helpForm');
  if (helpForm) {
    helpForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(helpForm);
    });
  }
  const modalForm = $('#modalForm');
  if (modalForm) {
    modalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(modalForm, { closeModal: true });
    });
  }

  // Очистка ошибки при вводе
  $$('input, select').forEach(inp => {
    inp.addEventListener('input', () => setFieldError(inp, ''));
    inp.addEventListener('change', () => setFieldError(inp, ''));
  });

  /* ---------- Маска телефона (мягкая) ---------- */
  $$('input[type="tel"]').forEach(inp => {
    inp.addEventListener('input', (e) => {
      const v = e.target.value;
      if (v.startsWith('@')) return; // telegram username — не трогаем
      const digits = v.replace(/\D+/g, '').slice(0, 11);
      if (!digits) return;
      let out = '+' + digits[0];
      if (digits.length > 1) out += ' ' + digits.slice(1, 4);
      if (digits.length >= 5) out += ' ' + digits.slice(4, 7);
      if (digits.length >= 8) out += '-' + digits.slice(7, 9);
      if (digits.length >= 10) out += '-' + digits.slice(9, 11);
      e.target.value = out;
    });
  });

})();
