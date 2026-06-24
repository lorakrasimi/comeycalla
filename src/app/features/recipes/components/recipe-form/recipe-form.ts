import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {UiButton} from '../../../../shared/ui/ui-button/ui-button';
import {RecipeImageField} from '../recipe-image-field/recipe-image-field';
import {UiTagsInput} from '../../../../shared/ui/ui-tags-input/ui-tags-input';
import {SelectOption, UiSelect} from '../../../../shared/ui/ui-select/ui-select';
import {DIFFICULTIES} from '../../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    UiButton,
    RecipeImageField,
    UiTagsInput,
    UiSelect,
  ],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss'
})
export class RecipeFormComponent implements OnInit  {
  @Input({required: true}) form!: FormGroup;
  @Input() imageUrl: string | null = null;
  @Input() submitting = false;
  difficultyOptions: SelectOption[] = [];

  @Output() submit = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() imageSelected = new EventEmitter<File>();
  @Output() imageRemoved = new EventEmitter<void>();

  ngOnInit(): void {
    this.ensureOneIngredient();
    this.ensureOneStep();

    this.difficultyOptions = DIFFICULTIES.map(
      (difficulty) => ({
        value: difficulty,
        label: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
      })
    )
  }

  // Asegura que exista al menos un ingrediente al iniciar el formulario.
  private ensureOneIngredient(): void {
    if (this.ingredients.length === 0) {
      this.addIngredient();
    }
  }

  // Asegura que exista al menos un paso al iniciar el formulario.
  private ensureOneStep(): void {
    if (this.steps.length === 0) {
      this.addStep();
    }
  }

  get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  get steps(): FormArray {
    return this.form.get('steps') as FormArray;
  }

  addIngredient(): void {
    this.ingredients.push(
      new FormGroup({
        name: new FormControl('', {
          nonNullable: true,
        }),
      })
    );
  }

  addStep(): void {
    this.steps.push(
      new FormGroup({
        description: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
      })
    );
  }

  removeIngredient(index: number): void {
    this.ingredients.removeAt(index);
  }

  removeStep(index: number): void {
    this.steps.removeAt(index);
  }

  // Emite el archivo de imagen seleccionado al componente padre.
  onImageSelected(file: File): void {
    this.imageSelected.emit(file);
  }

  onImageRemoved(): void {
    this.imageRemoved.emit();
  }

  onBack(): void {
    this.cancel.emit();
  }

  // Valida el formulario al pulsar submit.
  // Si el formulario es inválido, marca todos los campos como tocados
  // para mostrar los mensajes de error.
  // Si es válido, emite el evento submit.
  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      console.log('Formulario inválido');
      console.log(this.form.errors);

      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);

        if (control?.invalid) {
          console.log(`Campo: ${key}`);
          console.log('Valor:', control.value);
          console.log('Errores:', control.errors);
        }
      });

      return;
    }

    console.log('Formulario válido');
    this.submit.emit();
  }

  onDifficultyChange(value: string): void {
    this.form.controls["difficulty"].setValue(value);
  }
}
