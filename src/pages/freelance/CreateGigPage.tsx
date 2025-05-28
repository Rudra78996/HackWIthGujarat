import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { DollarSign } from 'lucide-react';

interface GigFormData {
  title: string;
  description: string;
  category: string;
  budget: string;
  duration: string;
  experience: string;
  skills: string;
}

const CreateGigPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<GigFormData>();

  const onSubmit = (data: GigFormData) => {
    console.log(data);
    // Handle form submission
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <h1 className="text-3xl font-bold mb-8">Create a New Gig</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <label htmlFor="title" className="label">
              Gig Title
            </label>
            <input
              id="title"
              type="text"
              className={`input ${errors.title ? 'border-error-500' : ''}`}
              placeholder="e.g., Senior React Developer Needed"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-error-500">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="label">
              Description
            </label>
            <textarea
              id="description"
              rows={6}
              className={`input ${errors.description ? 'border-error-500' : ''}`}
              placeholder="Describe the project and requirements..."
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-error-500">{errors.description.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category
            </label>
            <select
              id="category"
              className={`input ${errors.category ? 'border-error-500' : ''}`}
              {...register('category', { required: 'Category is required' })}
            >
              <option value="">Select a category</option>
              <option value="web-development">Web Development</option>
              <option value="mobile-development">Mobile Development</option>
              <option value="ui-ux">UI/UX Design</option>
              <option value="devops">DevOps</option>
              <option value="data-science">Data Science</option>
              <option value="blockchain">Blockchain</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-error-500">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <h2 className="text-xl font-bold mb-4">Project Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="budget" className="label">
                Budget Range
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input
                  id="budget"
                  type="text"
                  className={`input pl-10 ${errors.budget ? 'border-error-500' : ''}`}
                  placeholder="e.g., 80-100/hr"
                  {...register('budget', { required: 'Budget is required' })}
                />
              </div>
              {errors.budget && (
                <p className="mt-1 text-sm text-error-500">{errors.budget.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="duration" className="label">
                Project Duration
              </label>
              <select
                id="duration"
                className={`input ${errors.duration ? 'border-error-500' : ''}`}
                {...register('duration', { required: 'Duration is required' })}
              >
                <option value="">Select duration</option>
                <option value="less-than-1-month">Less than 1 month</option>
                <option value="1-3-months">1-3 months</option>
                <option value="3-6-months">3-6 months</option>
                <option value="more-than-6-months">More than 6 months</option>
              </select>
              {errors.duration && (
                <p className="mt-1 text-sm text-error-500">{errors.duration.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="experience" className="label">
                Required Experience Level
              </label>
              <select
                id="experience"
                className={`input ${errors.experience ? 'border-error-500' : ''}`}
                {...register('experience', { required: 'Experience level is required' })}
              >
                <option value="">Select experience level</option>
                <option value="entry">Entry Level</option>
                <option value="intermediate">Intermediate</option>
                <option value="expert">Expert</option>
              </select>
              {errors.experience && (
                <p className="mt-1 text-sm text-error-500">{errors.experience.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="skills" className="label">
                Required Skills
              </label>
              <input
                id="skills"
                type="text"
                className={`input ${errors.skills ? 'border-error-500' : ''}`}
                placeholder="e.g., React, TypeScript, Node.js"
                {...register('skills', { required: 'Skills are required' })}
              />
              {errors.skills && (
                <p className="mt-1 text-sm text-error-500">{errors.skills.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Separate skills with commas
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button type="button" className="btn-ghost">
            Save as Draft
          </button>
          <button type="submit" className="btn-primary">
            Post Gig
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default CreateGigPage;