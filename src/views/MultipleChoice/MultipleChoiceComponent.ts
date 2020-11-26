/*
 * Created by Jimmy Lan
 * Creation Date: 2020-11-23
 */

import { MultipleChoice, MultipleChoiceProps } from "../../models";
import { ComponentsMap, EventsMap } from "../../commonTypes";
import { QuestionStatus } from "../../models/Question";
import { QuestionContainer } from "../common/QuestionContainer";
import { OptionsForm } from "./OptionsForm";

export class MultipleChoiceComponent extends QuestionContainer<
  MultipleChoice,
  MultipleChoiceProps
> {
  private optionsForm?: OptionsForm;

  get eventsMap(): EventsMap {
    // Selectors
    const formButtonSelector = this.selectors.button;

    return {
      [`${formButtonSelector}:click`]: this.handleCheckAnswerClick,
    };
  }

  get componentsMap(): ComponentsMap {
    const childDivSelector = this.selectors.childDiv;
    return {
      optionsForm: childDivSelector,
    };
  }

  bindComponents = (): void => {
    this.optionsForm = new OptionsForm(this.components.optionsForm, this.model);
    this.optionsForm.render();
  };

  handleCheckAnswerClick = async (): Promise<void> => {
    // Determine the next state of the question component
    const isSelectionCorrect = await this.model.isUserSelectionsCorrect();
    const newStatusClassName = isSelectionCorrect ? "correct" : "warning";
    const newQuestionStatus = isSelectionCorrect
      ? QuestionStatus.correct
      : QuestionStatus.warning;

    // Set new state
    this.model.set(
      { questionStatus: newQuestionStatus },
      { shouldRerender: false }
    );

    // Compute if question needs to be disabled on the next state
    const shouldDisable = this.model.shouldDisable;

    // Select elements
    const statusContainer = document.querySelector<HTMLDivElement>(
      this.selectors.statusDiv
    );
    if (!this.optionsForm) {
      throw new Error(
        "Cannot handle event because OptionsForm failed to render."
      );
    }
    const optionInputs = document.querySelectorAll<HTMLInputElement>(
      this.optionsForm.selectors.optionInputs
    );
    const optionLabels = document.querySelectorAll<HTMLLabelElement>(
      this.optionsForm.selectors.optionLabels
    );

    // Update state of the question
    statusContainer?.classList.remove("correct", "warning");
    statusContainer?.classList.add(newStatusClassName);
    if (shouldDisable) {
      optionInputs.forEach(
        (input: HTMLInputElement) => (input.disabled = true)
      );
      optionLabels.forEach((label: HTMLLabelElement) =>
        label.classList.add("disabled")
      );
    }
  };
}