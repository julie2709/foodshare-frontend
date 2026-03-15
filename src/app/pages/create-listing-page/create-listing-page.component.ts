import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ListingService } from '../../core/services/listing.service';
import { ImageCompressionService } from '../../core/services/image-compression.service';
import { CreateListingPayload } from '../../shared/models/listing.model';
import { ReactiveFormsModule } from '@angular/forms';
// import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-create-listing-page',
  imports : [CommonModule,   ReactiveFormsModule],
  templateUrl: './create-listing-page.component.html',
  styleUrls: ['./create-listing-page.component.scss']
})
export class CreateListingPageComponent implements OnInit, OnDestroy {
  form!: FormGroup;

  isSubmitting = false;
  isCompressingImage = false;
  submitError = '';
  submitSuccess = '';

  selectedImageFile: File | null = null;
  imagePreviewUrl: string | null = null;
  imageInfo = '';
  minDate = '';

  categories: string[] = [
    'Fruits et légumes',
    'Produits laitiers',
    'Plats préparés',
    'Boulangerie',
    'Boissons',
    'Conserves',
    'Autres'
  ];

  constructor(
    private fb: FormBuilder,
    private listingService: ListingService,
    private imageCompressionService: ImageCompressionService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(120)]],
      description: [''],
      category: ['', Validators.required],
      quantity: [''],
      expiryDate: [''],
      postalCode: ['', [Validators.required, Validators.pattern(/^69\d{3}$/)]],
      city: [''],
      pickupInfo: [''],
      photo: [null, Validators.required]
    });

     const today = new Date();
  this.minDate = today.toISOString().split('T')[0];

  this.form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: [''],
    category: ['', Validators.required],
    quantity: [''],
    expiryDate: [''],
    postalCode: ['', [Validators.required, Validators.pattern(/^69\d{3}$/)]],
    city: [''],
    pickupInfo: [''],
    photo: [null, Validators.required]
  });
  }

  get f(): { [key: string]: AbstractControl } {
    return this.form.controls;
  }

  async onFileSelected(event: Event): Promise<void> {
    this.submitError = '';

    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const originalFile = input.files[0];

    try {
      this.isCompressingImage = true;

      const compressedFile =
        await this.imageCompressionService.compressImage(originalFile);

      this.selectedImageFile = compressedFile;

      this.form.patchValue({
        photo: compressedFile
      });

      this.form.get('photo')?.markAsTouched();
      this.form.get('photo')?.updateValueAndValidity();

      this.imageInfo =
        `${compressedFile.name} • ${this.imageCompressionService.formatBytes(compressedFile.size)}`;

      if (this.imagePreviewUrl) {
        URL.revokeObjectURL(this.imagePreviewUrl);
      }

      this.imagePreviewUrl = URL.createObjectURL(compressedFile);
    } catch (error: any) {
      this.removeImage();
      this.submitError =
        error?.message || 'Erreur lors de la compression de l’image.';
    } finally {
      this.isCompressingImage = false;
      input.value = '';
    }
  }

  removeImage(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }

    this.selectedImageFile = null;
    this.imagePreviewUrl = null;
    this.imageInfo = '';

    this.form.patchValue({
      photo: null
    });

    this.form.get('photo')?.markAsTouched();
    this.form.get('photo')?.updateValueAndValidity();
  }

  onSubmit(): void {
    this.submitError = '';
    this.submitSuccess = '';

    if (this.form.invalid || !this.selectedImageFile) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: CreateListingPayload = {
      title: this.f['title'].value.trim(),
      category: this.f['category'].value,
      postalCode: this.f['postalCode'].value.trim(),
      description: this.f['description'].value?.trim() || '',
      quantity: this.f['quantity'].value?.trim() || '',
      expiryDate: this.f['expiryDate'].value || '',
      city: this.f['city'].value?.trim() || '',
      pickupInfo: this.f['pickupInfo'].value?.trim() || '',
      photo: this.selectedImageFile
    };

    this.isSubmitting = true;

    this.listingService
      .create(payload)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: () => {
          this.submitSuccess = 'Votre don a bien été publié.';
          this.form.reset();
          this.removeImage();
        },
        error: (err) => {
          this.submitError =
            err?.error?.message ||
            'Une erreur est survenue lors de la création du don.';
        }
      });
  }

  ngOnDestroy(): void {
    if (this.imagePreviewUrl) {
      URL.revokeObjectURL(this.imagePreviewUrl);
    }
  }
}
