import { type SubmitHandler, useForm } from 'react-hook-form';
import clsx from 'clsx';
import type { UrlEntry } from '../types';

interface Props {
  onSubmit: SubmitHandler<UrlEntry>;
  loading: boolean;
  error: string;
  successShort: string | null;
}

export default function UrlForm({
  onSubmit,
  loading,
  error,
  successShort,
}: Props) {
  const { register, handleSubmit } = useForm<UrlEntry>();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={clsx(
        'p-6 rounded-2xl shadow-md bg-white border',
        successShort && 'border-green-400',
        error ? 'border-red-400' : 'border-gray-200'
      )}
    >
      <div className='relative'>
        <div class='absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            width='15'
            height='15'
            fill='none'
          >
            <path
              fill='currentColor'
              fill-rule='evenodd'
              d='M8.512 3.005c.676-.46 1.531-.468 2.167-.05.144.094.298.244.71.656.412.412.562.566.657.71.417.636.408 1.49-.051 2.167-.105.155-.267.32-.694.747l-.62.619a.5.5 0 0 0 .708.707l.619-.619.043-.043c.37-.37.606-.606.771-.849.675-.994.71-2.287.06-3.278-.159-.241-.39-.472-.741-.823l-.045-.045-.044-.045c-.352-.351-.583-.582-.824-.74-.99-.65-2.284-.616-3.278.06-.243.164-.48.4-.85.77l-.042.043-.619.62a.5.5 0 1 0 .707.706l.62-.618c.426-.427.592-.59.746-.695ZM4.318 7.147a.5.5 0 0 0-.707-.707l-.619.618-.043.043c-.37.37-.606.606-.771.85-.675.993-.71 2.287-.06 3.277.159.242.39.473.741.824l.045.045.044.044c.352.351.583.583.824.741.99.65 2.284.616 3.278-.06.243-.165.48-.401.849-.771l.043-.043.619-.619a.5.5 0 1 0-.708-.707l-.618.619c-.427.427-.593.59-.747.694-.676.46-1.532.469-2.167.051-.144-.094-.298-.245-.71-.657-.412-.412-.562-.566-.657-.71-.417-.635-.408-1.49.051-2.167.105-.154.267-.32.694-.747l.619-.618Zm5.304-1.061a.5.5 0 0 0-.707-.708L5.379 8.914a.5.5 0 1 0 .707.707l3.536-3.535Z'
              clip-rule='evenodd'
            />
          </svg>
        </div>
        <input
          {...register('originalUrl', { required: true })}
          autoFocus
          placeholder='Paste your URL here...'
          disabled={loading}
          className='block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50'
        />
        <button
          type='submit'
          disabled={loading}
          className='text-white absolute end-2.5 bottom-2.5 bg-black hover:bg-neutral-600 font-medium rounded-lg text-sm px-4 py-2'
        >
          Get shorter
        </button>
      </div>

      <div className='mt-4 flex gap-4'>
        <input
          {...register('alias', {
            pattern: {
              value: /^[a-zA-Z0-9_-]{1,20}$/,
              message: 'Only letters, digits, "-" and "_" are allowed',
            },
            maxLength: 20,
          })}
          type='text'
          placeholder='Alias (opt.)'
          disabled={loading}
          className='flex-1 px-3 py-2 rounded-lg bg-gray-50'
        />
        <input
          {...register('expiresAt')}
          type='date'
          disabled={loading}
          className='px-3 py-2 rounded-lg bg-gray-50'
        />
      </div>
    </form>
  );
}
