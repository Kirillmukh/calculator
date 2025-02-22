require(["jquery"], function ($) {
  const OPERANDS = new Set("+-*/");
  const output = $("#output");

  let result = [];
  let lastOperandIndex = 0;
  const localHistoryRanges = [[585, 600], [630, 663]];
  let localRange = 0;

  function reset(num) {
    result = [];
    result.push(0);
    // result.push("(")
    if (Number.isFinite(num)) result[0] = num;
    output.text(result.join(""));
  }

  reset();

  function showResults(string) {
    // if (string.length > 9) {
    //   string = string.slice(0, 12);
    // }
    output.text(string);
  }

  function compute() {
    const source = result.slice(0, result.length - 1);
    try {
      function apply_operand(operand) {
        if (operand === "+") {
          return (a, b) => a + b;
        } else if (operand === "-") {
          return (a, b) => a - b;
        } else if (operand === "*") {
          return (a, b) => a * b;
        } else if (operand === "/") {
          return (a, b) => a / b;
        } else return (a, b) => b;
      }

      const digits = [];
      const operands = [];
      let isLastDigit = false;

      for (const char of result) {
        if (char === '(') continue;
        if (char === ')') {
          const curr = digits.pop();
          const prev = digits.pop();
          const operand = operands.pop();
          const operand_func = apply_operand(operand);
          digits.push(operand_func.call(this, prev, curr));
        } else if (OPERANDS.has(char)) {
          isLastDigit = false;
          operands.push(char);
        } else {
          if (isLastDigit) {
            digits.push(digits.pop() * 10 + +char);
          } else {
            digits.push(+char);
          }
          isLastDigit = true;
        }
        console.log(digits);
        console.log(operands);
      }

      while (operands.length > 0) {
        const curr = digits.pop();
        const prev = digits.pop();
        const operand = operands.pop();
        const operand_func = apply_operand(operand);
        digits.push(operand_func.call(this, prev, curr));
      }

      addToLocalHistory(source, +digits[0]);
      reset(+digits[0]);
    } catch (e) {
      console.error("Threw exception: " + e);
      showResults("Error");
    }
  }

  function onClick(s, isDigit = false) {
    if (isDigit) {
      if (result[lastOperandIndex] == 0) {
        result[lastOperandIndex] = s;
      } else {
        result.push(s);
      }
    } else {
      result.push(s);
      lastOperandIndex = result.length;
    }
    showResults(result.join(""));
  }

  function setOnClickNumbers() {

    $("#0").click(() => onClick(0, true));
    $("#1").click(() => onClick(1, true));
    $("#2").click(() => onClick(2, true));
    $("#3").click(() => onClick(3, true));
    $("#4").click(() => onClick(4, true));
    $("#5").click(() => onClick(5, true));
    $("#6").click(() => onClick(6, true));
    $("#7").click(() => onClick(7, true));
    $("#8").click(() => onClick(8, true));
    $("#9").click(() => onClick(9, true));
  }

  function setOnClickOperators() {

    $("#addition").click(function () {
      onClick("+");
    });
    $("#subtract").click(function () {
      onClick("-");
    });
    $("#multiply").click(function () {
      onClick("*");
    });
    $("#divide").click(function () {
      onClick("/");
    });
    $("#float").click(function () {
      reset();
      // onClick(","); // todo
    });
    $("#parentheses_open").click(function () {
      onClick("(", true);
    });
    $("#parentheses_close").click(function () {
      if (count(result, "(") <= count(result, ")"))
        result.unshift("(");
      onClick(")");
    });

    $("#equals_btn").click(() => {

      result.push(")");
      compute();
    });
    $("#backspace").click(function () {
      result.pop();
      if (result.length === 0) {
        result.push(0);
      }
      result.forEach((value, index) => {
        if (OPERANDS.has(value)) {
          lastOperandIndex = index;
        }
      });
      if (result === -1) result = 0;
      showResults(result.join(""));
    })

  }

  $(document).ready(function () {
    setOnClickNumbers();
    setOnClickOperators();
  });

  function randInt(min, max) {
    const res = Math.floor(Math.random() * (max - min)) + min;
    console.log(res);
    return res;
  }

  function count(list, char) {
    return list.filter(ch => ch === char).length;
  }

  function addToLocalHistory(source, answer) {

    const width = randInt(...localHistoryRanges[localRange]);
    localRange = +(!localRange);
    const button = $(`<button class="history_entity">${source.join("")} = ${answer}</button>`);

    button.css(
      {
        "min-width": width,
        "max-width": width,
        width: `${width}px !important`,
      })

    button.click(function () {
      result = source;
      showResults(result.join(""));
    })

    $(".history_entity_container").append(button);
  }
});
